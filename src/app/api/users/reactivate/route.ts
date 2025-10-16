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
    const body = await request.json();
    const { status } = body;

    // const legacyReactivateEnvelope = {
    //   requestId: generateRequestId(),
    //   action: status ? "reactivate" : "logout",
    // };

    if (!status) {
      const res = NextResponse.json(
        {
          success: false,
          statusCode: 400,
          message: "You will be redirected to the login page",
        },
        { status: 400 }
      );

      res.cookies.delete("sessionId");
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("accessExp");

      return res;
    }

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

    const userAgent = request.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/users/account/reactivate`,
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

    // const alternateReactivate = async () => {
    // return fetch(`${process.env.BACKEND_BASE_URL}/users/account/reactivate?lite=true`, { method: "PATCH" });
    // };

    if (!backendRes.ok) {
      const error = await backendRes.json().catch(() => ({}));
      console.log(`${pathname} error: `, error);
      const res = NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 400,
          message: error?.message || "Account reactivation failed",
        },
        { status: backendRes.status || 400 }
      );

      res.cookies.delete("sessionId");
      res.cookies.delete("accessToken");
      res.cookies.delete("refreshToken");
      res.cookies.delete("accessExp");

      return res;
    }

    const response = await backendRes.json();

    return NextResponse.json(
      {
        success: true,
        statusCode: response.statusCode || 200,
        message: response.message || "Account reactivated successfully",
        data: response.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`${pathname} error: `, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message:
          error instanceof Error
            ? error.message
            : "Account deactivation failed",
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
