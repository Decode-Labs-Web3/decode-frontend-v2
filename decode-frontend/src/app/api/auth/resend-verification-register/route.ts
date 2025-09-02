import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = cookies();
    const reg = (await cookieStore).get("registration_data")?.value;

    if (!reg) {
      return NextResponse.json(
        { message: "No pending registration data" },
        { status: 400 }
      );
    }

    let parsed: { email?: string; username?: string };
    try {
      parsed = JSON.parse(reg);
    } catch {
      return NextResponse.json(
        { message: "Corrupted registration data" },
        { status: 400 }
      );
    }

    const email = parsed.email;
    if (!email) {
      return NextResponse.json(
        { message: "Email not found in cookie" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      `${process.env.BACKEND_URL}/auth/register/send-email-verification`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          message: data.message || "Resend failed",
          statusCode: data.statusCode || backendRes.status,
        },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: data.message || "Verification email resent",
      },
      { status: 200 }
    );
  } catch (e) {
    console.error("Resend error:", e);
    return NextResponse.json(
      { message: "Server error", error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}