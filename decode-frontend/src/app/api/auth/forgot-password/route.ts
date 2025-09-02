import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Forgot password request:', body);

    const { email } = body;

    if (!email) {
      return NextResponse.json({ message: "Missing email" }, { status: 400 });
    }

    const requestBody = { 
      email,
    };
    
    console.log('Sending to backend:', requestBody);

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/password/forgot/initiate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const response = await backendRes.json();
    console.log('Backend response:', response);

    return NextResponse.json({ success: true, message: "Forgot password request sent", statusCode: response.statusCode }, { status: 200 });
  }
  catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ message: "Forgot password error" }, { status: 400 });
  }
}