import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const internalRequest = request.headers.get("frontend-internal-request");
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
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not found" },
        { status: 401 }
      );
    }
    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: "Invalid session token",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Token refreshed successfully",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Invalid session token",
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
