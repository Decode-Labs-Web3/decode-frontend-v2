import { NextResponse } from "next/server";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

function isoToMaxAgeSeconds(expiresAtISO: string): number {
  const now = Date.now();
  const expMs = Date.parse(expiresAtISO);
  return Math.max(0, Math.floor((expMs - now) / 1000));
}

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { code } = body;

    // console.log(`${pathname} :`, code)

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Code is required",
        },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/login/fingerprint/email-verification`,
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

    // console.log(`${pathname} error:`, backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
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
    // console.log(`${pathname}:`, response);

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Login successful"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Login successful",
      });

      const accessExpISO = response.data.expires_at as string;
      const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
      const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);
      // console.log("this is accessMaxAge", accessMaxAge);
      // console.log("this is accessExpSec", accessExpSec);
      // console.log(`this is login ${pathname}`, response.data);

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("accessExp", String(accessExpSec), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: accessMaxAge,
      });

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message || "Login failed",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
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
