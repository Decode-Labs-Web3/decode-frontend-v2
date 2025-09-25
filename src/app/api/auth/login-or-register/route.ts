import { NextResponse } from "next/server";
import { generateRequestId, guardInternal, apiPathName } from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req)
  const denied = guardInternal(req);
  if (denied) return denied;

  try {

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

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/info/exist-by-email-or-username`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok && backendResponse.status != 400) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/login-or-register backend error status:",
        backendResponse.status
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status,
          message: error?.message || `HTTP ${backendResponse.status}`,
        },
        { status: backendResponse.status }
      );
    }

    const response = await backendResponse.json();

    if (
      response.success &&
      response.message === "User found" &&
      response.statusCode === 200
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "User found",
      });
      res.cookies.set("email_or_username", email_or_username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 120,
      });

      res.cookies.set("gate-key-for-login", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/login",
        maxAge: 120,
      });
      return res;
    }

    if (
      !response.success &&
      response.message === "User not found" &&
      response.statusCode === 404
    ) {
      const res = NextResponse.json({
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message || "User not found",
      });

      res.cookies.set("email_or_username", email_or_username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 120,
      });

      res.cookies.set("gate-key-for-register", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/register",
        maxAge: 120,
      });
      return res;
    }

    return NextResponse.json({
      success: false,
      statusCode: response.statusCode || 400,
      message: response.message || "Login or register failed",
    });
  } catch (error) {
    console.error("/api/auth/login-or-register handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 400,
        message: "Server error from login or register",
      },
      { status: 400 }
    );
  }
  finally {
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
