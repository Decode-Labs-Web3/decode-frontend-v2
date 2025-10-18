import { NextResponse } from "next/server";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";
import { httpStatus } from "@/constants/index.constants";

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
          statusCode: httpStatus.BAD_REQUEST,
          message: "Code is required",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/password/forgot/verify-email`,
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
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Invalid email verification code",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.log(`${pathname}:`, response);

    const res = NextResponse.json(
      {
        success: true,
        statusCode: backendResponse.status || httpStatus.OK,
        message: response.message || "Password code verified",
      },
      { status: backendResponse.status || httpStatus.OK }
    );

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
      maxAge: 60 * 5,
    });

    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server error from login",
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
