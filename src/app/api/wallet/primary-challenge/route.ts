import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const pathname = apiPathName(request);
  const denied = guardInternal(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { address } = body || {};
    if (!address) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing address",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    // console.info(`${pathname} address:`, address);

    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
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
      `${process.env.BACKEND_BASE_URL}/wallets/primary/challenge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Link challenge failed",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Link challenge generated",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: error instanceof Error ? error.message : "Network error",
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
