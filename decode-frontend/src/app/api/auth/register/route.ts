import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Request from frontend:', body);
    
    const { email, username, password } = body;

    if (!email || !username || !password) {
      console.log('Missing credentials:', { email, username, password });
      return NextResponse.json({ message: "Missing credentials" }, { status: 400 });
    }

    const requestBody = { 
      email, 
      username, 
      password
    };

    console.log('Sending to backend:', requestBody);

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
        message: "Email already exists",
        error: "Bad Request",
        statusCode: 400
      }, { status: 400 });
    }

    // Handle successful registration with email verification
    if (response.success && response.message === "Email verification sent") {
      console.log('Email verification sent successfully');
      
      // Store registration data temporarily for verification
      const res = NextResponse.json({ 
        success: true,
        message: "Email verification sent",
        requiresVerification: true,
        statusCode: response.statusCode
      }, { status: 200 });
      
      // Store registration data in a secure cookie for verification
      res.cookies.set('registration_data', JSON.stringify({
        email,
        username,
        password
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10, // 10 minutes
      });
      
      return res;
    }

    // Handle other backend errors
    if (!backendRes.ok) {
      console.log('Backend registration failed:', { status: backendRes.status, error: response });
      return NextResponse.json({ 
        message: response.message || "Registration failed",
        error: response.error || "Bad Request",
        statusCode: response.statusCode || backendRes.status
      }, { status: backendRes.status || 400 });
    }

    // Handle other successful responses (if any)
    if (response.success) {
      return NextResponse.json({ 
        success: true,
        message: response.message || "Registration successful",
        statusCode: response.statusCode
      }, { status: 200 });
    }

    // Fallback error response
    return NextResponse.json({ 
      message: response.message || "Registration failed",
      error: response.error || "Unknown error",
      statusCode: response.statusCode || 500
    }, { status: 500 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      message: "Server error", 
      error: "Internal Server Error",
      statusCode: 500 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}