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
    const { page } = body;

    // console.log(`${pathname}: `, page);

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

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/notifications?page=${page}&limit=15`,
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

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }

    const response = await backendResponse.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Notifications retrieved successfully",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${pathname} error: `,error);
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
