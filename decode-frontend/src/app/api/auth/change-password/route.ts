import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const { new_password } = body;
    
    const code = (await cookies()).get("forgot_code")?.value;

    if (!code) {
      return NextResponse.json({ message: "Missing verification code in cookie" }, { status: 400 });
    }
    if (!new_password) {
      return NextResponse.json({ message: "Missing new password" }, { status: 400 });
    }

    const payload = { code, new_password } as const;

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/password/forgot/change`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Debug backend response
    console.log('Change password backend status:', backendRes.status);
    try {
      console.log('Change password backend headers:', Object.fromEntries(backendRes.headers.entries()));
    } catch {}

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        { message: err?.message || "Password change failed" },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    console.log('Change password backend body:', response);

    const res = NextResponse.json({ 
      success: true, 
      statusCode: response?.statusCode ?? 200,
      message: response?.message ?? "Password changed successfully" 
    });
    // Clear the forgot_code cookie on success
    res.cookies.set("forgot_code", "", { maxAge: 0, path: "/" });
    return res;
  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: "Method Not Allowed" }, { status: 405 });
}

