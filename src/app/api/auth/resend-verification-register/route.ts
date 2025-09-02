import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const reg = (await cookieStore).get("registration_data")?.value;

    if (!reg) {
      return NextResponse.json({
          success: false,
          statusCode: 400,
          message: "No pending registration data",
        },
        { status: 400 }
      );
    }

    let parsed: { email?: string; username?: string };
    try {
      parsed = JSON.parse(reg);
    } catch {
      return NextResponse.json({
          success: false,
          statusCode: 400,
          message: "Corrupted registration data",
        },
        { status: 400 }
      );
    }

    const email = parsed.email;
    if (!email) {
      return NextResponse.json({
          success: false,
          statusCode: 400,
          message: "Email not found in cookie",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      email,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/auth/register/send-email-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    
    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Resend failed",
        },{ status: backendRes.status || 400 });
    }

    const response = await backendRes.json().catch(() => ({}));
    return NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Verification email resent",
      },{ status: 200 });
      
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    statusCode: 405,
    message: "Method Not Allowed",
  }, { status: 405 });
}