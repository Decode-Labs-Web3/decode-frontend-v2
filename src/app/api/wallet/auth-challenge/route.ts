import { NextRequest, NextResponse } from "next/server";
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
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing address",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      address,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/auth/challenge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
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
          statusCode: backendRes.status || 401,
          message: "Invalid address",
        },
        { status: backendRes.status || 401 }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname}:`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Auth challenge generated",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Invalid address",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
