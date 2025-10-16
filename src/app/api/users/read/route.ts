import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  apiPathName,
  guardInternal,
  generateRequestId,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { id } = body;

    // console.log(`this is ${pathname}`, id)

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

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/notifications/${id}/read`,
      {
        method: "PATCH",
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
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Notification marked as read successfully",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}
