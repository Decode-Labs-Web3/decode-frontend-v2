import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import { generateRequestId, guardInternal, apiPathName } from '@/utils/index.utils'

export async function POST(req: Request) {
  const requestId = generateRequestId()
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if(denied) return denied

  try {
    const body = await req.json();
    const { email_or_username, password } = body;

    if (!email_or_username || !password) {
      return NextResponse.json(
        { success: false, message: "Email/username and password are required" },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed, device, browser } = fingerprintResult;

    const requestBody = {
      email_or_username,
      password,
      fingerprint_hashed,
      browser,
      device,
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/login`,
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

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/login backend error:",
        error || backendResponse.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Login failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Login successful"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Login successful",
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

    if (
      response.success &&
      response.statusCode === 400 &&
      response.message ===
        "Device fingerprint not trusted, send email verification"
    ) {
      const res = NextResponse.json(
        {
          success: true,
          statusCode: response.statusCode || 400,
          message:
            response.message ||
            "Device fingerprint not trusted, send email verification",
        },
        { status: 200 }
      );

      res.cookies.set("gate-key-for-verify-login", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      });

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message || "Login failed",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("/api/auth/login handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error from login",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`)
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
