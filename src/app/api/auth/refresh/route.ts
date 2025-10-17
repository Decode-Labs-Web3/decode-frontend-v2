import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
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
    // const cookieStore = await cookies();
    // const refreshToken = cookieStore.get("refreshToken")?.value;
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 401,
          message: "No refresh token found",
        },
        { status: 401 }
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
        body: JSON.stringify({ refreshToken }),
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
          statusCode: backendRes.status || 401,
          message: "Invalid session token",
        },
        { status: backendRes.status || 401 }
      );

      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("sessionId");
      res.cookies.delete("accessExp");

      return res;
    }

    const response = await backendRes.json();

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Session refreshed",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    const res = NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Invalid session token",
      },
      { status: 500 }
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
