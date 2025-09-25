import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import { guardInternal, apiPathName, generateRequestId } from "@/utils/index.utils"

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  const pathname = apiPathName(request)
  const denied = guardInternal(request)
  if(denied) return denied

  try {
    const body = await request.json();
    const { address } = body || {};
    if (!address) {
      return NextResponse.json(
        { success: false, statusCode: 400, message: "Missing address" },
        { status: 400 }
      );
    }

    console.info("this is api/wallet/primary-challenge response", address);

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, statusCode: 401, message: "No access token found" },
        { status: 401 }
      );
    }

    const userAgent = request.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/primary/challenge`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          fingerprint: fingerprint_hashed,
          "X-Request-Id": requestId
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const response = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: response?.message || "Link challenge failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Link challenge generated",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Link challenge error:", error);
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

export async function GET() {
  return NextResponse.json(
    { success: false, statusCode: 405, message: "Method Not Allowed" },
    { status: 405 }
  );
}
