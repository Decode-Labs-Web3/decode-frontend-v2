import { NextResponse } from "next/server";
import { FingerprintService } from "@/app/services/fingerprint.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email_or_username, password } = body;

    if (!email_or_username || !password) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing credentials"
      }, { status: 400 });
    }

    // Generate device fingerprint using the fingerprint service
    const fingerprintResult = FingerprintService.generateFingerprint(req);
    const { fingerprint_hashed, deviceInfo} = fingerprintResult;

    // Validate the generated fingerprint
    const validation = FingerprintService.validateFingerprint(fingerprint_hashed);
    if (!validation.isValid) {
      console.error('Fingerprint validation failed:', validation.errors);
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: validation.errors.join(', ')
      }, { status: 400 });
    }

    console.log('Device info:', deviceInfo);

    const requestBody = {
      email_or_username,
      password,
      fingerprint_hashed,
      browser: "Chrome",
      device: "Macbook Pro"
    };

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    console.log('Backend response:', backendRes);

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json({ 
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "Login failed" 
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();

    // Check if this is a fingerprint verification request
    if (response.success && response.message === "Device fingerprint not trusted, send email verification") {
      console.log('Device fingerprint verification required');
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Device verification required",
      }, { status: 200 });
    }

    // Check if response has tokens
    const accessToken = response?.data?.access_token;
    const refreshToken = response?.data?.session_token;
    const expiresAtISO = response?.data?.expires_at as string | undefined;

    console.log('Extracted tokens:', { accessToken, refreshToken, expiresAtISO });

    // Handle different response scenarios
    if (!accessToken || !refreshToken) {
      console.log('No tokens found in response');

      // Check if this is a successful response but requires verification
      if (response.success && response.statusCode === 400) {
        return NextResponse.json({
          success: true,
          requiresVerification: true,
          statusCode: response.statusCode || 200,
          message: response.message || "Device verification required",
        }, { status: 200 });
      }

      // Return detailed error for debugging
      return NextResponse.json({
        success: false,
        statusCode: response.statusCode || 500,
        message: response.message || "Login failed - no tokens received",
      }, { status: 500 });
    }

    const res = NextResponse.json({ 
      success: true,
      statusCode: response.statusCode || 200,
      message: response.message || "Login successful"
    });

    res.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    const refreshCookieOpts = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
    };

    if (expiresAtISO) {
      res.cookies.set("refreshToken", refreshToken, {
        ...refreshCookieOpts,
        expires: new Date(expiresAtISO),
      });
    } else {
      res.cookies.set("refreshToken", refreshToken, {
        ...refreshCookieOpts,
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    // Set the from_success cookie for middleware authentication
    res.cookies.set("from_success", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return res;
  } catch (error) {
    console.log('Login error:', error);
    console.error('Login error:', error);
    return NextResponse.json({ 
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error from login",
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
