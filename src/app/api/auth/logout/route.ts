import { cookies } from "next/headers";
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

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;
    const requestBody = {
      session_token: refreshToken,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/logout`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "Logout failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Failed to logout",
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
