import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/fingerprint.service";
import { sanitizeText } from "@/utils/sanitization.utils";
import {
  createSecurityErrorResponse,
  SecurityErrorMessages,
  logSecurityEvent,
  generateRequestId,
} from "@/utils/security-error-handling.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  console.log("requestId from login api:", requestId);

  try {
    const internalRequest = req.headers.get("frontend-internal-request");
    if (internalRequest !== "true") {
      logSecurityEvent("MISSING_INTERNAL_HEADER", { requestId }, "high");
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.MISSING_HEADER,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    const body = await req.json();
    const { email_or_username, password } = body;

    if (!email_or_username || !password) {
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          SecurityErrorMessages.VALIDATION_ERROR,
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const passwordValidation = sanitizeText(password, {
      maxLength: 128,
      minLength: 1,
      allowSpecialChars: true,
      allowNumbers: true,
      allowLetters: true,
      required: true,
    });

    if (!email_or_username) {
      logSecurityEvent(
        "INVALID_EMAIL_FORMAT",
        { requestId, email: email_or_username },
        "medium"
      );
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          "Invalid email or username",
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    if (!passwordValidation.isValid) {
      logSecurityEvent("INVALID_PASSWORD_FORMAT", { requestId }, "medium");
      return NextResponse.json(
        createSecurityErrorResponse(
          400,
          "Invalid password format",
          process.env.NODE_ENV === "production",
          requestId
        ),
        { status: 400 }
      );
    }

    // Use sanitized values
    const sanitizedEmail = email_or_username;
    const sanitizedPassword = passwordValidation.sanitizedValue;

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed, device, browser } = fingerprintResult;

    const requestBody = {
      email_or_username: sanitizedEmail,
      password: sanitizedPassword,
      fingerprint_hashed,
      browser,
      device,
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(
        "/api/auth/login backend error:",
        error || backendResponse.statusText
      );
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 401,
          message: error?.message || "Login failed",
        },
        { status: backendResponse.status || 401 }
      );
    }

    const response = await backendResponse.json();

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

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 15,
      });

      const refreshTokenAge = Math.floor(
        (new Date(response.data.expires_at).getTime() - Date.now()) / 1000
      );

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: refreshTokenAge > 0 ? refreshTokenAge : 0,
      });

      return res;
    }

    if (
      response.success &&
      response.statusCode === 400 &&
      response.message ===
        "Device fingerprint not trusted, send email verification"
    ) {
      const res = NextResponse.json(
        {
          success: true,
          statusCode: response.statusCode || 400,
          message:
            response.message ||
            "Device fingerprint not trusted, send email verification",
        },
        { status: 200 }
      );

      res.cookies.set("gate-key-for-verify-login", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 5,
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
    console.error("/api/auth/login handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Server error from login",
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
