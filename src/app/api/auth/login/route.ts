import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/fingerprint.services";
import { authExpire, httpStatus } from "@/constants/index.constants";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

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
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Email/username and password are required",
        },
        { status: httpStatus.BAD_REQUEST }
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
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    // console.log("fingerprint_hashed", fingerprint);

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
          statusCode: backendResponse.status || httpStatus.UNAUTHORIZED,
          message: error?.message || "Failed to login",
        },
        { status: backendResponse.status || httpStatus.UNAUTHORIZED }
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
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Login successful",
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

      res.cookies.set(
        "accessExp",
        String(Math.floor(Date.now() / 1000) + authExpire.accessToken),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: authExpire.accessToken,
        }
      );

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.refreshToken,
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
          statusCode: response.statusCode || httpStatus.BAD_REQUEST,
          message:
            response.message ||
            "Device fingerprint not trusted, send email verification",
        },
        { status: httpStatus.OK }
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
        statusCode: response.statusCode || httpStatus.BAD_REQUEST,
        message: response.message || "Login failed",
      },
      { status: httpStatus.BAD_REQUEST }
    );
  } catch (error) {
    console.error("/api/auth/login handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to login",
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
