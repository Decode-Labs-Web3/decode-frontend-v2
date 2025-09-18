import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const internalRequest = req.headers.get('frontend-internal-request');
    if (internalRequest !== 'true') {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: 'Missing Frontend-Internal-Request header'
      }, { status: 400 });
    }

    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing credentials",
      }, { status: 400 });
    }

    const requestBody = {
      email,
      username,
      password
    };

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/register/email-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    const response = await backendRes.json();

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error("/api/auth/register backend error:", error || backendRes.statusText);
      return NextResponse.json({
        success: false,
        statusCode: backendRes.status || 400,
        message: error?.message || "Registration failed",
      }, { status: backendRes.status || 400 });
    }

    if (response.success && response.statusCode === 200 && response.message === "Email verification sent") {

      const res = NextResponse.json({
        success: true,
        requiresVerification: true,
        statusCode: response.statusCode,
        message: response.message || "Email verification sent",
      }, { status: 200 });

      res.cookies.set('gate-key-for-verify-register', 'true', {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });

      return res;
    }

  } catch (error) {
    console.error("/api/auth/register handler error:", error);
    return NextResponse.json({
      success: false,
      statusCode: 500,
      message: "Server error from register",
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    statusCode: 405,
    message: "Method Not Allowed",
  }, { status: 405 });
}