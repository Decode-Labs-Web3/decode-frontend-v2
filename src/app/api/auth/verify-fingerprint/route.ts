import { NextResponse } from "next/server";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";
import { cookies } from "next/headers";

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
    const { otp } = body;

    // console.log("this is otp form", otp)

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Code are required"
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const verify_device_fingerprint_session_token = cookieStore.get("verify_device_fingerprint_session_token")?.value;

    if (!verify_device_fingerprint_session_token) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const resquestBody = {
      verify_device_fingerprint_session_token,
      otp
    }

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/2fa/fingerprint-trust`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(resquestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log("this is backendResponse for login", backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/verify-login backend error:",
        error || backendResponse.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Invalid email verification otp",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.log("this is response from login", response);

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
      console.log("this is accessMaxAge", accessMaxAge);
      console.log("this is accessExpSec", accessExpSec);
      console.log(`this is login ${pathname}`, response.data);

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
