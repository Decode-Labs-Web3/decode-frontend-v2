import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import { generateRequestId, apiPathName, guardInternal } from "@/utils/index.utils"

export async function GET(req: Request) {
  const requestId = generateRequestId()
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if(denied) return denied

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

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
      `${process.env.BACKEND_BASE_URL}/users/profile/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          fingerprint: fingerprint_hashed,
          "X-Request-Id": requestId
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      console.error(
        "Backend API error:",
        backendRes.status,
        backendRes.statusText
      );
      const errorData = await backendRes.json().catch(() => ({}));
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

    const data = await backendRes.json();
    console.log("Overview data:", data);
    return NextResponse.json(
      {
        success: true,
        statusCode: data.statusCode || 200,
        message: data.message || "Overview fetched successfully",
        data: data.data,
      },
      { status: data.statusCode || 200 }
    );
  } catch (error) {
    console.error("Overview API error:", error);
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
