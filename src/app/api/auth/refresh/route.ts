import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authExpire, httpStatus } from "@/constants/index.constants";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;
  try {
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "No refresh token found",
        },
        { status: httpStatus.UNAUTHORIZED }
      );
    }

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ session_token: refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      const res = NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.UNAUTHORIZED,
          message: "Invalid session token",
        },
        { status: backendRes.status || httpStatus.UNAUTHORIZED }
      );

      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("sessionId");
      res.cookies.delete("accessExp");

      return res;
    }

    const response = await backendRes.json();

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Session refreshed"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Session refreshed",
      });

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.accessToken,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.accessToken,
      });

      res.cookies.set(
        "accessExp",
        String(Math.floor(Date.now() / 1000) + authExpire.accessToken),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: authExpire.accessToken,
        }
      );

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.refreshToken,
      });

      return res;
    }
  } catch (error) {
    console.error(`${pathname} error:`, error);
    const res = NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error ? error.message : "Invalid session token",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );

    res.cookies.delete("accessToken");
    res.cookies.delete("refreshToken");
    res.cookies.delete("sessionId");
    res.cookies.delete("accessExp");

    return res;
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
