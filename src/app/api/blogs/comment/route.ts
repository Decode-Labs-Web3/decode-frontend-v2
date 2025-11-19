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

    const body = await req.json();
    const { postId, content } = body;

    if (!postId || !content) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "postId and content are required",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEBLOG_BACKEND_URL}/api/comments/post`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-fingerprint-hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ postId, content }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.error(`${pathname} :`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error.message,
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();

    // console.log(`${pathname} :`, response);

    return NextResponse.json(
      {
        success: response.success || true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Comment created successfully",
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
        message: "Internal Server Error",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}]`);
  }
}

export async function PUT(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
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

    const body = await req.json();
    const { commentId, content } = body;

    if (!commentId || !content) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "commentId and content are required",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEBLOG_BACKEND_URL}/api/comments/put/${commentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-fingerprint-hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify({ content }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.error(`${pathname} :`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error.message,
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();

    // console.log(`${pathname} :`, response);

    return NextResponse.json(
      {
        success: response.success || true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Comment updated successfully",
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
        message: "Internal Server Error",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}]`);
  }
}

export async function DELETE(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
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

    const body = await req.json();
    const { commentId } = body;

    if (!commentId) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "commentId and content are required",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    const backendResponse = await fetch(
      `${process.env.DEBLOG_BACKEND_URL}/api/comments/delete/${commentId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "x-fingerprint-hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.error(`${pathname} :`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error.message,
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();

    // console.log(`${pathname} :`, response);

    return NextResponse.json(
      {
        success: response.success || true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Comment updated successfully",
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
        message: "Internal Server Error",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}]`);
  }
}
