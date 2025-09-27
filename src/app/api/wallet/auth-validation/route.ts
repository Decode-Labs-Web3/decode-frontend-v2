import { NextRequest, NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
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
          statusCode: 400,
          message: "Missing address or signature",
        },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed, device, browser } = fingerprintResult;

    const requestBody = {
      address,
      signature,
      fingerprint_hashed,
      device,
      browser,
    };

    console.log("Request body from auth validation:", requestBody);

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
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: "Invalid address or signature",
        },
        { status: backendRes.status || 401 }
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
        maxAge: 60 * 15,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      const refreshTokenAge = Math.floor(
        (new Date(response.data.expires_at).getTime() - Date.now()) / 1000
      );

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshTokenAge > 0 ? refreshTokenAge : 0,
      });

      return res;
    }
  } catch (error) {
    console.error("Auth challenge error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Invalid address",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
