import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
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
    const { email_or_username } = body;

    if (!email_or_username) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing email or username",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      email_or_username,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/password/forgot/initiate`,
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

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Failed to initiate password reset",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Password reset email sent"
    ) {
      const res = NextResponse.json(
        {
          success: true,
          statusCode: response?.statusCode || httpStatus.OK,
          message: response?.message || "Password reset email sent",
        },
        { status: httpStatus.OK }
      );

      res.cookies.set("gate-key-for-verify-forgot", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60,
      });

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response?.statusCode || httpStatus.BAD_REQUEST,
        message: response?.message || "Failed to initiate password reset",
      },
      { status: httpStatus.BAD_REQUEST }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to initiate password reset",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: httpStatus.METHOD_NOT_ALLOWED,
      message: "Method Not Allowed",
    },
    { status: httpStatus.METHOD_NOT_ALLOWED }
  );
}
