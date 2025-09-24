import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/fingerprint.service";
import { generateRequestId } from "@/utils/security-error-handling.utils";

export async function GET(req: Request) {
  const requestId = generateRequestId();

  try {
    const internalRequest = req.headers.get("X-Frontend-Internal-Request");
    if (internalRequest !== "true") {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "Missing X-Frontend-Internal-Request header",
        },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, statusCode: 401, message: "No access token found" },
        { status: 401 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed } = fingerprintResult;

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/link/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          fingerprint: fingerprint_hashed,
          "X-Request-ID": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.error("Backend API error:", error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status,
          message: error.message || "Backend API error",
        },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    console.log("link all wallet data:", data);
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
    console.info("/api/users/overview", requestId);
  }
}
