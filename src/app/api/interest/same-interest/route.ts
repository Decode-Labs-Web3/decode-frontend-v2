import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
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
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed } = fingerprintResult;

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/interest/suggest-user?page=0&limit=10`,
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

    if (!backendRes.ok && backendRes.status !== 404) {
      const errorData = await backendRes.json().catch(() => ({}));
      console.error("Overview fetch error:", errorData);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status,
          message:
            errorData.message || `Backend API error: ${backendRes.status}`,
        },
        { status: backendRes.status }
      );
    }

    if (backendRes.status === 404) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 404,
          message: "User interests not found",
        },
        { status: 200 }
      );
    }

    const response = await backendRes.json();
    console.log("User interests fetched:", response);
    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message:
          response.message || "Interest-based suggestions fetched successfully",
        data: response.data,
      },
      { status: response.statusCode || 200 }
    );
  } catch (error) {
    console.error("Same Interest API error:", error);
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
