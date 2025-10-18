import { cookies } from "next/headers";
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
    // const cookieStore = await cookies();
    // const refreshToken = cookieStore.get("refreshToken")?.value;
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "No refresh token provided",
        },
        { status: httpStatus.UNAUTHORIZED }
      );
    }

    const fingerprint = (await cookies()).get("fingerprint")?.value;

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing fingerprint header",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const requestBody = {
      session_token: refreshToken,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
          "X-Fingerprint-Hashed": fingerprint,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log(`${pathname} error:`, backendRes);

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.log(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.UNAUTHORIZED,
          message: error?.message || "Logout failed",
        },
        { status: backendRes.status || httpStatus.UNAUTHORIZED }
      );
    }

    // cookieStore.delete("accessToken");
    // cookieStore.delete("refreshToken");
    // cookieStore.delete("sessionId");
    // cookieStore.delete("accessExp");

    const res = NextResponse.json(
      {
        success: true,
        statusCode: httpStatus.OK,
        message: "Logout successful",
      },
      { status: httpStatus.OK }
    );

    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("sessionId");
    res.cookies.delete("accessExp");

    return res;
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Failed to logout",
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
