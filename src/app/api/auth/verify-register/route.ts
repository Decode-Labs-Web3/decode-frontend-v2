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
    const { code } = body;

    if (!code) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing verification code",
      }, { status: 400 });
    }

    const requestBody = {
      code,
    };

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/register/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: error?.message || "Verification failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    if (response.success && response.message === "User created successfully") {

      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Account created successfully! You can now log in.",
      });
      res.cookies.set('registration_data', '', { maxAge: 0, path: '/' });

      return res;
    }

    return NextResponse.json({
      success: false,
      statusCode: response.statusCode || 400,
      message: response.message || "Verification failed",
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Server error from verify register",
    }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    statusCode: 405,
    message: "Method Not Allowed",
  }, { status: 405 });
}