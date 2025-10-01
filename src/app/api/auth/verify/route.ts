import { NextResponse } from "next/server";
import { VerifyRequest } from "@/interfaces/index.interfaces";
import { generateRequestId, guardInternal, apiPathName } from "@/utils/index.utils"

const VERIFY_ENDPOINTS = {
  register: "/auth/register/verify-email",
  login: "/auth/login/fingerprint/email-verification",
  forgot: "/auth/password/forgot/verify-email",
};

const SUCCESS_MESSAGES = {
  register: "User created successfully",
  login: "Login successful",
  forgot: "Password code verified",
};

function isoToMaxAgeSeconds(expiresAtISO: string): number {
  const now = Date.now();
  const expMs = Date.parse(expiresAtISO);
  return Math.max(0, Math.floor((expMs - now) / 1000));
}

export async function POST(req: Request) {
  const requestId = generateRequestId()
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if (denied) return denied
  try {
    const body: VerifyRequest = await req.json();
    const { code, type } = body;

    if (!code || !type) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing verification code or type",
        },
        { status: 400 }
      );
    }

    const endpoint = VERIFY_ENDPOINTS[type];
    if (!endpoint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Invalid verification type",
        },
        { status: 400 }
      );
    }

    const requestBody = { code };
    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Verification failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    const expectedMessage = SUCCESS_MESSAGES[type];

    if (response.success && response.message === expectedMessage) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Verification successful",
        type,
        requiresRelogin: type === "login",
      });

      const accessExpISO = response.data.expires_at as string;
      const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
      const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);
      console.log("this is accessMaxAge", accessMaxAge);
      console.log("this is accessExpSec", accessExpSec);
      console.log(`this is login ${pathname}`, response.data);

      if (type === "login") {
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
      }

      if (type === "forgot") {
        res.cookies.set("forgot_code", code, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 5,
        });

        res.cookies.set("gate-key-for-change-password", "true", {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60,
        });
      } else if (type === "register") {
        res.cookies.set("registration_data", "", { maxAge: 0, path: "/" });
        res.cookies.set("verification_required", "", { maxAge: 0, path: "/" });
      }

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message || "Invalid verification code",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("/api/auth/verify handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Server error from verify",
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
