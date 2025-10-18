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
    const body = await req.json();
    const { sessionId } = body;
    // console.log("Request body Revoke API:", body);

    // const cookieStore = await cookies();
    // const deviceId = cookieStore.get("sessionId")?.value;
    // const accessToken = cookieStore.get("accessToken")?.value;

    const deviceId = (await cookies()).get("sessionId")?.value;
    // console.log("this is device id",deviceId)
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!sessionId || !deviceId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing session ID or device ID",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "No access token found",
        },
        { status: httpStatus.UNAUTHORIZED }
      );
    }

    const requestBody = {
      session_id: sessionId,
    };

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

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/revoke`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.log(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Failed to revoke all device fingerprints",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname} :`, response);

    if (sessionId === deviceId) {
      const res = NextResponse.json(
        {
          success: true,
          statusCode: response.statusCode || httpStatus.OK,
          message: response.message || "Session revoked",
          reload: true,
        },
        { status: httpStatus.OK }
      );

      res.cookies.delete("sessionId");
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");

      return res;
    }

    return NextResponse.json(
      {
        success: response.success || true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Device fingerprint revoked",
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Failed to revoke all device fingerprints",
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
