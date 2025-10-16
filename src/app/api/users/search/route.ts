import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";
import { fingerprintService } from "@/services/index.services";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name } = body;

    // console.log(`${pathname} name:`,name)

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/users/search?email_or_username=${name}&page=0&limit=10`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error.message || `Backend API error: ${pathname}`,
        },
        { status: backendRes.status }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname}: `, response)

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode,
        message: response.message || "Search successful",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal server error",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
