import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const internalRequest = req.headers.get("frontend-internal-request");
    if (internalRequest !== "true") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing Frontend-Internal-Request header",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { email_or_username } = body;

    if (!email_or_username) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing email or username",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      email_or_username,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/password/forgot/initiate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(
        "/api/auth/forgot-password backend error:",
        error || backendRes.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "User not found",
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Password reset email sent"
    ) {
      const res = NextResponse.json(
        {
          success: true,
          statusCode: response?.statusCode || 200,
          message: response?.message || "Password reset email sent",
        },
        { status: 200 }
      );

      res.cookies.set("gate-key-for-verify-forgot", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response?.statusCode || 400,
        message: response?.message || "User not found",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("/api/auth/forgot-password handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error from forgot password",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
