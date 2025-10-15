import { cookies } from "next/headers";
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
    // const cookieStore = await cookies();
    // const code = cookieStore.get("forgot_code")?.value;
    const code = (await cookies()).get("forgot_code")?.value;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing verification code",
        },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { new_password } = body;

    if (!new_password) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing new password",
        },
        { status: 400 }
      );
    }

    const resquestBody = {
      code,
      new_password,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/password/forgot/change`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(resquestBody),
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
          statusCode: backendRes.status || 400,
          message: error?.message || "Password change failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    const res = NextResponse.json({
      success: true,
      statusCode: response.statusCode || 200,
      message: response.message || "Password changed successfully",
    });

    res.cookies.set("forgot_code", "", {
      maxAge: 0,
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : "Server error from change password",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: $requestId}`);
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
