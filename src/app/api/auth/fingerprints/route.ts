import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

export async function GET(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
    const accessToken = (await cookies()).get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Missing fingerprint",
        },
        { status: httpStatus.BAD_REQUEST }
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
      `${process.env.BACKEND_BASE_URL}/auth/fingerprints`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
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
          statusCode: backendRes.status || httpStatus.INTERNAL_SERVER_ERROR,
          message: error?.message || "Failed to fetch fingerprints",
        },
        { status: backendRes.status || httpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname} error:`, response);

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Device fingerprint fetched"
    ) {
      return NextResponse.json(
        {
          success: true,
          statusCode: response.statusCode || httpStatus.OK,
          message: response.message || "Device fingerprint fetched",
          data: response.data,
        },
        { status: response.statusCode || httpStatus.OK }
      );
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || httpStatus.BAD_REQUEST,
        message: response.message || "Failed to fetch fingerprints",
      },
      { status: response.statusCode || httpStatus.BAD_REQUEST }
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
            : "Failed to fetch device fingerprints",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
