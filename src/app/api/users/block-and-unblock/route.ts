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

    const fingerprint = req.headers.get("X-Fingerprint-Hashed");

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
      user_id_to: id,
    };

    console.log(`${pathname} : `, requestBody);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/block/blocking`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error.message || "Failed to block user",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }
    const response = await backendResponse.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Block action successful",
        data: response.data || null,
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.log(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to block user",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}

export async function DELETE(req: Request) {
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

    const fingerprint = req.headers.get("X-Fingerprint-Hashed");

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
    // console.log(`${pathname} id: `, id);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/block/unblocking/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error.message || "Failed to unblock user",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }
    const response = await backendResponse.json();
    console.log(`${pathname} : `, response);
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Unblock action successful",
        data: response.data || null,
      },
      { status: response.statusCode || httpStatus.OK }
    );
  } catch (error) {
    console.log(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to unblock user",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}
