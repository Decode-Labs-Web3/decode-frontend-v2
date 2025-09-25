import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import { generateRequestId } from "@/utils/index.utils";

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
        {
          success: false,
          statusCode: 400,
          message: "Missing fingerprint",
        },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || "";
    const fingerprintResult = await fingerprintService(userAgent);
    const { fingerprint_hashed } = fingerprintResult;
    console.log("Fingerprint result from fingerprints api:", fingerprintResult);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/fingerprints`,
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
      const error = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status,
          message: error?.message || "Failed to fetch fingerprints",
        },
        { status: backendRes.status }
      );
    }

    const responseData = await backendRes.json();
    console.log("Response Fingerprints API:", responseData);

    if (
      responseData.success &&
      responseData.statusCode === 200 &&
      responseData.message === "Device fingerprint fetched"
    ) {
      return NextResponse.json(
        {
          success: true,
          statusCode: responseData.statusCode || 200,
          message: responseData.message || "Device fingerprint fetched",
          data: responseData.data,
        },
        { status: responseData.statusCode || 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: responseData.statusCode || 400,
        message: responseData.message || "Failed to fetch fingerprints",
      },
      { status: responseData.statusCode || 400 }
    );
  } catch (error) {
    console.error("Fingerprints API error:", error);
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
    console.info("/api/auth/fingerprints", requestId);
  }
}
