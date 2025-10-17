import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
          statusCode: 400,
          message: "Missing fingerprint",
        },
        { status: 400 }
      );
    }

    const fingerprint = (await cookies()).get("fingerprint")?.value;

    if (!fingerprint) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing fingerprint header",
        },
        { status: 400 }
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
          statusCode: backendRes.status,
          message: error?.message || "Failed to fetch fingerprints",
        },
        { status: backendRes.status }
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
          statusCode: response.statusCode || 200,
          message: response.message || "Device fingerprint fetched",
          data: response.data,
        },
        { status: response.statusCode || 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || 400,
        message: response.message || "Failed to fetch fingerprints",
      },
      { status: response.statusCode || 400 }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch fingerprints",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
