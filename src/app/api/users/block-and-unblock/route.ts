import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";
import { fingerprintService } from "@/services/index.services";

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
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

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
          "X-Fingerprint-Hashed": fingerprint_hashed,
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
          statusCode: backendResponse.status || 400,
          message: error.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }
    const response = await backendResponse.json();
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Block action successful",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
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
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    // console.log(`${pathname} id: `, id);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/block/unblocking/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
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
          statusCode: backendResponse.status || 400,
          message: error.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }
    const response = await backendResponse.json();
    console.log(`${pathname} : `, response);
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Unblock action successful",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}
