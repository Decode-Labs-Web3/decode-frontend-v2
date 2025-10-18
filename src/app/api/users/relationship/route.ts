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

    const body = await req.json();
    const { id } = body;

    // console.log(`${pathname} id: `,id)

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
      `${process.env.BACKEND_BASE_URL}/users/profile/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || httpStatus.BAD_REQUEST,
          message: error.message || "Failed to fetch profile",
        },
        { status: backendRes.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname}: `, response)

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Profile fetched successfully",
        data: response.data,
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message:
          error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
