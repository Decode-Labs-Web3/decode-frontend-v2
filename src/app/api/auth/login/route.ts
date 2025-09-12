import { NextResponse } from "next/server";
import { FingerprintService } from "@/app/services/fingerprint.service";

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
    const { email_or_username, password } = body;

    if (!email_or_username || !password) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing credentials"
      }, { status: 400 });
    }

    let fingerprintResult;
    try {
      fingerprintResult = FingerprintService.generateFingerprint(req);
      console.log('Fingerprint result:', fingerprintResult);
    } catch (fingerprintError) {
      console.error('Fingerprint generation failed:', fingerprintError);
      throw new Error(`Fingerprint generation failed: ${fingerprintError instanceof Error ? fingerprintError.message : 'Unknown error'}`);
    }

    const { fingerprint_hashed, device, browser } = fingerprintResult;
    console.log('Backend URL:', process.env.BACKEND_URL);

    if (!process.env.BACKEND_URL) {
      throw new Error('BACKEND_URL environment variable is not set');
    }

    const validation = FingerprintService.validateFingerprint(fingerprint_hashed);
    if (!validation.isValid) {
      console.error('Fingerprint validation failed:', validation.errors);
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: validation.errors.join(', ')
      }, { status: 400 });
    }

    const requestBody = {
      email_or_username,
      password,
      fingerprint_hashed,
      browser,
      device,
    };

    const backendResponse = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      return NextResponse.json({
        success: false,
        statusCode: backendResponse.status || 401,
        message: error?.message || "Login failed"
      },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();

    if (response.success && response.statusCode === 200 && response.message === "Login successful") {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Login successful"
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(response.data.expires_at) || new Date(Date.now() + 60 * 60 * 24 * 30),
      });

      console.log('Cookies set - accessToken:', response.data.access_token ? 'present' : 'missing');
      console.log('Cookies set - refreshToken:', response.data.session_token ? 'present' : 'missing');

      return res;
    }

    if (response.success && response.statusCode === 400 && response.message === "Device fingerprint not trusted, send email verification") {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 400,
        message: response.message || "Device fingerprint not trusted, send email verification",
      }, { status: 200 });

      res.cookies.set("gate-key-for-verify-login", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
      });

      return res;
    }

    return NextResponse.json({
      success: false,
      statusCode: response.statusCode || 400,
      message: response.message || "Login failed",
    }, { status: 400 });


  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error from login",
      error: error instanceof Error ? error.stack : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    statusCode: 405,
    message: "Method Not Allowed"
  }, { status: 405 });
}
