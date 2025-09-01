import { NextResponse } from "next/server";
import { FingerprintService } from "@/app/services/fingerprint.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request from frontend:', body);
    
    const { email_or_username, password } = body;

    if (!email_or_username || !password) {
      console.log('Missing credentials:', { email_or_username, password });
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    // Generate device fingerprint using the fingerprint service
    const fingerprintResult = FingerprintService.generateFingerprint(req);
    const { fingerprint_hashed } = fingerprintResult;
    
    // Validate the generated fingerprint
    const validation = FingerprintService.validateFingerprint(fingerprint_hashed);
    if (!validation.isValid) {
      console.error('Fingerprint validation failed:', validation.errors);
      return NextResponse.json({ 
        message: "Invalid fingerprint generated", 
        errors: validation.errors 
      }, { status: 400 });
    }

    const requestBody = { 
      email_or_username, 
      password,
      fingerprint_hashed
    };

    console.log('Sending to backend:', requestBody);

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      console.log('Backend login failed:', { status: backendRes.status, error: err });
      return NextResponse.json(
        { message: err?.message || "Login failed" },
        { status: backendRes.status || 401 }
      );
    }

    console.log('Backend response status:', backendRes.status);
    console.log('Backend response headers:', Object.fromEntries(backendRes.headers.entries()));

    const response = await backendRes.json();
    console.log('Backend response data:', response);

    // Check if this is a fingerprint verification request
    if (response.success && response.message === "Device fingerprint not trusted, send email verification") {
      console.log('Device fingerprint verification required');
      return NextResponse.json({ 
        success: true,
        message: "Device verification required",
        requiresVerification: true,
        statusCode: response.statusCode
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
          message: "Device verification required",
          requiresVerification: true,
          statusCode: response.statusCode
        }, { status: 200 });
      }
      
      // Return detailed error for debugging
      return NextResponse.json({ 
        message: response.message || "Login failed - no tokens received",
        responseData: response,
        statusCode: response.statusCode
      }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    const isProd = process.env.NODE_ENV === "production";

    res.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15,
    });

    const refreshCookieOpts = {
      httpOnly: true,
      secure: isProd,
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
      secure: isProd,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5, // 5 minutes
    });

    return res;
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
