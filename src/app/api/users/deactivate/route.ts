import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { fingerprintService } from "@/services/index.services";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";

export async function DELETE(request: NextRequest) {
  const requestId = generateRequestId();
  const pathname = apiPathName(request);
  const denied = guardInternal(request);
  if (denied) return denied;

  try {
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
      `${process.env.BACKEND_BASE_URL}/users/account/deactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    const response = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      console.log("this is api/users/deactivate response", response);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: response?.message || "Account deactivation failed",
        },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Account deactivated successfully, it will be permanently deleted after 1 month",
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
        message: error instanceof Error ? error.message : "Account deactivation failed",
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
