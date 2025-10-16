import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
} from "@/utils/index.utils";

export async function GET(req: Request) {
  const userAgent = req.headers.get("user-agent") || "";
  const fingerprintResult = await fingerprintService(userAgent);
  const { fingerprint_hashed } = fingerprintResult;

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

    // console.log(`${pathname} : `, accessToken);
    // console.log(`${pathname} : `,fingerprint_hashed);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/users/username/change/initiate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Username change failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Email verification sent",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Network error",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function POST(req: Request) {
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

  const userAgent = req.headers.get("user-agent") || "";
  const fingerprintResult = await fingerprintService(userAgent);
  const { fingerprint_hashed } = fingerprintResult;

  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const { username, username_code } = body;
    // console.log(`${pathname} username and code: `, username,username_code);

    if (!username || !username_code) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing username or username code",
        },
        { status: 400 }
      );
    }

    const requestBody = {
      new_username: username,
      code: username_code,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/users/username/change/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => null);
      console.error(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Username change failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    const response = await backendRes.json().catch(() => ({}));
    // console.log(`${pathname}: `, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Username changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Network error",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
