import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email_or_username } = body;

    if (!email_or_username) {
      return NextResponse.json({ 
        success: false,
        statusCode: 400,
        message: "Missing email or username",
      }, { status: 400 });
    }

    const requestBody = { 
      email_or_username,
    };
    
    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/password/forgot/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( requestBody ),
    });

    
    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json({
        success: false,
        statusCode: backendRes.status || 400,
        message: error?.message || "User not found",
      }, { status: backendRes.status || 400 });
    }
    
    const response = await backendRes.json().catch(() => ({}));
    return NextResponse.json({ 
      success: true, 
      statusCode: response?.statusCode || 200, 
      message: response?.message || 'Password reset email sent' 
    }, { status: 200 });
  }
  catch (error) {
    return NextResponse.json({ 
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Server error from forgot password",
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