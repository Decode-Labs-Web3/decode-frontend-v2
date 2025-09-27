import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  guardInternal,
  apiPathName,
  generateRequestId,
} from "@/utils/index.utils";
import { fingerprintService } from "@/services/index.services";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          status: false,
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    console.log('this is relationship id ',id)

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/user/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );

    if(!backendResponse.ok){
      const errorMessage = await backendResponse.json().catch(() => ({}));
      return NextResponse.json({
        status: false,
        statusCode: backendResponse.status || 400,
        message: errorMessage.message || `Backend API error: ${pathname}`
      },{status: backendResponse.status})
    }

    const response = await backendResponse.json()
    console.log(pathname, response)
    return NextResponse.json({
      status: true,
      statusCode: response.statusCode,
      message: response.message,
      data: response.data
    },{status: response.statusCode || 200})
  } catch (error){
    console.error(error)
  } finally {
    console.info(`${pathname}: ${requestId}`)
  }
}
