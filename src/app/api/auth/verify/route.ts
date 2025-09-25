import { NextResponse } from "next/server";
import { VerifyRequest } from "@/interfaces/index.interfaces";
import { generateRequestId } from "@/utils/index.utils";

const VERIFY_ENDPOINTS = {
  register: "/auth/register/verify-email",
  login: "/auth/login/fingerprint/email-verification",
  forgot: "/auth/password/forgot/verify-email",
};

const SUCCESS_MESSAGES = {
  register: "User created successfully",
  login: "Device fingerprint verified",
  forgot: "Password code verified",
};

export async function POST(req: Request) {
  const requestId = generateRequestId();

  try {
    const internalRequest = req.headers.get("X-Frontend-Internal-Request");
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
          "X-Request-ID": requestId,
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

      // Set cookies based on verification type
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
        // Clear registration data cookies after successful verification
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
    console.info("/api/auth/verify", requestId);
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
