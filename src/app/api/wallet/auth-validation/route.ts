import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { fingerprintService } from "@/services/fingerprint.services";
import { authExpire, httpStatus } from "@/constants/index.constants";
import { guardInternal, apiPathName, generateRequestId } from "@/utils/index.utils"

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const pathname = apiPathName(request)
  const denied = guardInternal(request)
  if(denied) return denied

  try {
    const body = await request.json();
    const { address, signature } = body;

    if (!address || !signature) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing address or signature",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { device, browser } = fingerprintResult;

    const fingerprint = request.headers.get("X-Fingerprint-Hashed");

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      address,
      signature,
      fingerprint_hashed: fingerprint,
      device,
      browser,
    };

    // console.log(`${pathname}:`, requestBody);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/auth/validation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: "Invalid address or signature",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Challenge validated successfully"
    ) {

      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Challenge validated successfully",
        data: response.data,
      });

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.sessionToken,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.accessToken,
      });

      res.cookies.set("accessExp", String(Math.floor(Date.now() / 1000) + authExpire.accessToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: '/',
        maxAge: authExpire.accessToken,
      });

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.refreshToken,
      });

      return res;
    }
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Invalid address",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: httpStatus.METHOD_NOT_ALLOWED,
      message: "Method Not Allowed",
    },
    { status: httpStatus.METHOD_NOT_ALLOWED }
  );
}
