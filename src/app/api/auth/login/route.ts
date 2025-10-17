import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

function isoToMaxAgeSeconds(expiresAtISO: string): number {
  const now = Date.now();
  const expMs = Date.parse(expiresAtISO);
  return Math.max(0, Math.floor((expMs - now) / 1000));
}

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

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
    const { device, browser } = fingerprintResult;

    const fingerprint = (await cookies()).get("fingerprint")?.value;

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing fingerprint header",
        },
        { status: 400 }
      );
    }

    console.log("fingerprint_hashed", fingerprint);

    const requestBody = {
      email_or_username,
      password,
      fingerprint_hashed: fingerprint,
      browser,
      device,
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log(`${pathname} error:`, backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
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
    // console.log(`${pathname} :`, response);

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

      const accessExpISO = response.data.expires_at as string;
      const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
      const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);
      // console.log("this is accessMaxAge", accessMaxAge);
      // console.log("this is accessExpSec", accessExpSec);
      // console.log(`this is login ${pathname}`, response.data);

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("accessExp", String(accessExpSec), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Please verify OTP to login"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Please verify OTP to login",
      });

      res.cookies.set(
        "login_session_token",
        response.data.login_session_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5,
        }
      );

      res.cookies.set("gate-key-for-verify-otp", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      });

      return res;
    }

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Please verify OTP to verify device fingerprint"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message:
          response.message || "Please verify OTP to verify device fingerprint",
      });

      res.cookies.set(
        "verify_device_fingerprint_session_token",
        response.data.verify_device_fingerprint_session_token,
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5,
        }
      );

      res.cookies.set("gate-key-for-verify-fingerprint", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
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
