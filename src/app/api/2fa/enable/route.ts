import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
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
    const { otp } = body;

    // console.log(`${pathname}:`,otp)

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/2fa/enable`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ otp }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}));
      console.error(`${pathname} error:`, errorData);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: errorData.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();

    // console.log(`${pathname} error:`, backendResponse)
    // console.log(`${pathname} :`, response)

    return NextResponse.json(
      {
        success: response.success || true,
        statusCode: response.statusCode || 200,
        message: response.message || "OTP enabled successfully",
        data: response.data || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: [${requestId}]`);
  }
}
