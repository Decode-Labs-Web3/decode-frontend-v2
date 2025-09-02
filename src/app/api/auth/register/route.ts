import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
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
    });

    const response = await backendRes.json();
    console.log('Backend response data:', response);

    // Handle "Email already exists" error
    if (response.message === "Email already exists" && response.statusCode === 400) {
      console.log('Email already exists error');
      return NextResponse.json({
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message,
      }, { status: 400 });
    }

    // Handle successful registration with email verification
    if (response.success && response.message === "Email verification sent") {
      console.log('Email verification sent successfully');

      // Store registration data temporarily for verification
      const res = NextResponse.json({
        success: true,
        requiresVerification: true,
        statusCode: response.statusCode,
        message: response.message || "Email verification sent",
      }, { status: 200 });

      // Store registration data in a secure cookie for verification
      res.cookies.set('registration_data', JSON.stringify({
        email,
        username,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 3,
      });

      return res;
    }

    // Handle other backend errors
    if (!backendRes.ok) {
      console.log('Backend registration failed:', { status: backendRes.status, error: response });
      return NextResponse.json({
        success: false,
        statusCode: response.statusCode || backendRes.status,
        message: response.message || "Registration failed",
      }, { status: backendRes.status || 400 });
    }

    // Handle other successful responses (if any)
    if (response.success) {
      return NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Registration successful",
      }, { status: 200 });
    }

    // Fallback error response
    return NextResponse.json({
      success: false,
      statusCode: response.statusCode || 500,
      message: response.message || "Registration failed",
    }, { status: 500 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error from register",
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