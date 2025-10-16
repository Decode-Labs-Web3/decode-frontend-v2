import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  generateRequestId,
  apiPathName,
  guardInternal,
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
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    // console.log(`${pathname} id: `, id);

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/snapshot/last-month/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok && backendRes.status !== 403) {
      const error = await backendRes.json().catch(() => ({}));
      console.error(`${pathname} error: `, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status,
          message: error.message || `Backend API error: ${backendRes.status}`,
        },
        { status: backendRes.status }
      );
    }

    const response = await backendRes.json();
    // console.log(`${pathname} : `, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message:
          response.message ||
          "Followers snapshot data last month fetched successfully",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error ? error.message : "Failed to fetch overview",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}
