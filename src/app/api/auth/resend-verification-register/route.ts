import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
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
    // const cookieStore = cookies();
    // const reg = (await cookieStore).get("registration_data")?.value;
    const reg = (await cookies()).get("registration_data")?.value;

    if (!reg) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "No pending registration data",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    let parsed: { email?: string; username?: string };
    try {
      parsed = JSON.parse(reg);
    } catch {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Corrupted registration data",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const email = parsed.email;
    if (!email) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Email not found in cookie",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      email,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/register/send-email-verification`,
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
          message: error?.message || "Resend failed",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Verification email resent",
      },
      { status: httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Server error",
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
