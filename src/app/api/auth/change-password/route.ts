import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { new_password } = body;
    const code = (await cookies()).get("forgot_code")?.value;

    if (!code) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing verification code",
      }, { status: 400 });
    }

    if (!new_password) {
      return NextResponse.json({
        success: false,
        statusCode: 400,
        message: "Missing new password",
      }, { status: 400 });
    }

    const resquestBody = {
      code,
      new_password
    };

    const backendRes = await fetch(`${process.env.BACKEND_URL}/auth/password/forgot/change`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(resquestBody),
    });

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json({
        success: false,
        statusCode: backendRes.status || 400,
        message: error?.message || "Password change failed",
      },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    const res = NextResponse.json({
      success: true,
      statusCode: response.statusCode || 200,
      message: response.message || "Password changed successfully"
    });

    // Clear the forgot_code cookie on success
    res.cookies.set("forgot_code", "", {
      maxAge: 0,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    return res;

  } catch (error) {
    return NextResponse.json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error from change password",
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

