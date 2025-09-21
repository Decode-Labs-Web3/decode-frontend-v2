import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const internalRequest = request.headers.get("X-Frontend-Internal-Request");
    if (internalRequest !== "true") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing X-Frontend-Internal-Request header",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing address",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      address,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/auth/challenge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: "Invalid address",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    console.log("Auth challenge response:", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Auth challenge generated",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error("Auth challenge error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Invalid address",
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
