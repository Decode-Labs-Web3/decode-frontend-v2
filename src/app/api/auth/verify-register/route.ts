import { NextResponse } from "next/server";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { code } = body;

    // console.log("this is code form", code)

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Code are required",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/register/verify-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ code }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log("this is backendResponse for login", backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/verify-register backend error:",
        error || backendResponse.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error?.message || "Invalid email verification code",
        },
        { status: backendResponse.status || 400 }
      );
    }

    const response = await backendResponse.json();
    // console.log("this is response from verify register", response);

    return NextResponse.json(
      {
        success: true,
        statusCode: backendResponse.status || 200,
        message: response.message || "User created successfully",
      },
      { status: backendResponse.status || 200 }
    );
  } catch (error) {
    console.error("/api/auth/verify-register handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error from login",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
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
