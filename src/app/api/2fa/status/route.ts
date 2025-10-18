import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { httpStatus } from "@/constants/index.constants";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
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
      `${process.env.BACKEND_BASE_URL}/auth/2fa/status`,
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

    // console.log(`${pathname} error:`,  backendRes)

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      // console.error(`${pathname} error:`, errorData);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || `Backend API error: ${backendRes.status}`,
        },
        { status: backendRes.status || httpStatus.INTERNAL_SERVER_ERROR }
      );
    }

    // if (backendRes.status === 404) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       statusCode: 404,
    //       message: "OTP not found",
    //     },
    //     { status: 200 }
    //   );
    // }

    const response = await backendRes.json();
    // console.log(`${pathname} :`, response);
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message,
        data: response.data,
      },
      { status: httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error ? error.message : "Failed to fetch OTP status",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
