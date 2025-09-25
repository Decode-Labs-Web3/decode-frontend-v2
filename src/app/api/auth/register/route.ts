import { NextResponse } from "next/server";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing credentials",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      email,
      username,
      password,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/register/email-verification`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-ID": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const response = await backendRes.json();

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(
        "/api/auth/register backend error:",
        error || backendRes.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Registration failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Email verification sent"
    ) {
      const res = NextResponse.json(
        {
          success: true,
          requiresVerification: true,
          statusCode: response.statusCode,
          message: response.message || "Email verification sent",
        },
        { status: 200 }
      );

      res.cookies.set("gate-key-for-verify-register", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });

      res.cookies.set( "registration_data", JSON.stringify({
        email,
          username,
        }),
        {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 10,
        }
      );

      res.cookies.set("verification_required", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
      });

      return res;
    }
  } catch (error) {
    console.error("/api/auth/register handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error from register",
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
