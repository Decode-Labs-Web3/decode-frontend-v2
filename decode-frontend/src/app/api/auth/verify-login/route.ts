import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();    
    const { code } = body;

    if (!code ) {
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
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: error?.message || "Verification failed",
        },{ status: backendRes.status || 401 });
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
        maxAge: 60 * 5,
      });

      return res;
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
