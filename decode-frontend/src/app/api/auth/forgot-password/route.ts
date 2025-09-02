import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Forgot password request:', body);

    const { username_or_email } = body;

    if (!username_or_email) {
      return NextResponse.json({ message: "Missing username or email" }, { status: 400 });
    }

    const requestBody = { 
      username_or_email,
    };
    
    console.log('Sending to backend:', requestBody);

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/password/forgot/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const response = await backendRes.json().catch(() => null);
    console.log('Backend response:', response);

    if (!backendRes.ok) {
      const message = response?.message || "User not found";
      const statusCode = response?.statusCode || backendRes.status || 400;
      return NextResponse.json({
        success: false,
        statusCode,
        message,
        error: response?.error || 'Bad Request',
        timestamp: response?.timestamp,
        path: response?.path || '/auth/password/forgot/initiate'
      }, { status: statusCode });
    }

    return NextResponse.json({ 
      success: true, 
      statusCode: response?.statusCode || 200, 
      message: response?.message || 'Password reset email sent' 
    }, { status: 200 });
  }
  catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: "Forgot password error" }, { status: 400 });
  }
}