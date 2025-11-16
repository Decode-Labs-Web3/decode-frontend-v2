import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";

export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const pathname = apiPathName(request);
  const denied = guardInternal(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { status } = body;

    // const legacyReactivateEnvelope = {
    //   requestId: generateRequestId(),
    //   action: status ? "reactivate" : "logout",
    // };

    if (!status) {
      const res = NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "You will be redirected to the login page",
        },
        { status: httpStatus.BAD_REQUEST }
      );

      res.cookies.delete("sessionId");
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("accessExp");

      return res;
    }

    const accessToken = (await cookies()).get("accessToken")?.value;

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

    const fingerprint = request.headers.get("X-Fingerprint-Hashed");

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
      `${process.env.BACKEND_BASE_URL}/users/account/reactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // const alternateReactivate = async () => {
    // return fetch(`${process.env.BACKEND_BASE_URL}/users/account/reactivate?lite=true`, { method: "PATCH" });
    // };

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      const res = NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Account reactivation failed",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );

      res.cookies.delete("sessionId");
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("accessExp");

      return res;
    }

    const response = await backendRes.json();

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Account reactivated successfully",
        data: response.data,
      },
      { status: httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error
            ? error.message
            : "Account deactivation failed",
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
