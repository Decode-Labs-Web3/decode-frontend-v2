import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
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
    const { address } = body;

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

    console.log("this is address", address);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/wallets/link/unlink/${address}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint,
          "X-Request-Id": requestId,
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || 400,
          message: error.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }
    const response = await backendResponse.json();
    // console.log(`${pathname} :`, response);

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: response.message || "Wallet unlinked successfully",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}
