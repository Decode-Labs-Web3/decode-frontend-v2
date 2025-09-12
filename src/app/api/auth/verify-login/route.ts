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

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login/fingerprint/email-verification`, {
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
        }, { status: backendRes.status || 401 });
    }

    const response = await backendRes.json().catch(() => ({}));

    if (response.success && response.message === "Device fingerprint verified") {
      return NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Device fingerprint verified. Please login again.",
        requiresRelogin: true
      });
    }

    return NextResponse.json({
      success: false,
      statusCode: response.statusCode || 400,
      message: response.message || "Verification failed",
    }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error from verify login",
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
