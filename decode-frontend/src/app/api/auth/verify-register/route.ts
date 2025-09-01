import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Verification request:', body);

    const { code } = body;

    if (!code) {
      return NextResponse.json({ message: "Missing verification code" }, { status: 400 });
    }

    const requestBody = { 
      code,
    };

    console.log('Sending verification to backend:', requestBody);

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/register/verify-email`, {
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
    if (response.success && response.message === "User created successfully") {
      console.log('User registration completed successfully');
      
      // Clear the registration data cookie after successful verification
      const res = NextResponse.json({ 
        success: true,
        message: "Account created successfully! You can now log in.",
        statusCode: response.statusCode
      });
      res.cookies.set('registration_data', '', { maxAge: 0, path: '/' });
      
      return res;
    }

    // Handle other responses
    return NextResponse.json({ 
      message: response.message || "Verification failed",
      success: false 
    }, { status: 400 });

  } catch (error) {
    console.error('Verify register error:', error);
    return NextResponse.json({ message: "Verify register error" }, { status: 400 });
  }
}