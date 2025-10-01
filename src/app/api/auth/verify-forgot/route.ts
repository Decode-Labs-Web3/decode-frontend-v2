import { NextResponse } from "next/server";
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
    const { code } = body;

    // console.log("this is code form", code)

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Code are required"
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/password/forgot/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({code}),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log("this is backendResponse for login", backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/verify-forgot backend error:",
        error || backendResponse.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Invalid email verification code",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.log("this is response from verify-forgot", response);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: backendResponse.status || 200,
        message: response.message || "Password code verified",
      },
      { status: backendResponse.status || 200 }
    );

    res.cookies.set("forgot_code", code, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    })

    res.cookies.set("gate-key-for-change-password", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return res
  } catch (error) {
    console.error("/api/auth/verify-forgot handler error:", error);
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
