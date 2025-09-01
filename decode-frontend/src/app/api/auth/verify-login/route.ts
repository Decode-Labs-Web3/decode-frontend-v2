import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Verification request:', body);
    
    const { code } = body;

    if (!code ) {
      console.log('Missing verification data:', { code });
      return NextResponse.json({ message: "Missing verification code" }, { status: 400 });
    }

    const requestBody = { 
      code,
    };

    console.log('Sending verification to backend:', requestBody);

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/login/fingerprint/email-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      console.log('Backend verification failed:', { status: backendRes.status, error: err });
      return NextResponse.json(
        { message: err?.message || "Verification failed" },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    console.log('Backend verification response:', response);

    // Check if verification was successful
    if (response.success && response.message === "Device fingerprint verified") {
      // Device fingerprint verified - user needs to login again to get tokens
      console.log('Device fingerprint verified successfully');
      return NextResponse.json({ 
        success: true,
        message: "Device fingerprint verified. Please login again.",
        requiresRelogin: true
      });
    }
    
    // Check if verification was successful and tokens are provided
    if (response.success && response.data?.access_token) {
      const accessToken = response.data.access_token;
      const refreshToken = response.data.session_token;
      const expiresAtISO = response.data.expires_at as string | undefined;

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
    }

    return NextResponse.json({ 
      message: response.message || "Verification failed",
      success: false 
    }, { status: 400 });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}
