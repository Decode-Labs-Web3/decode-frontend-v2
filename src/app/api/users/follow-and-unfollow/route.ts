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
    // const cookieStore = await cookies();
    // const accessToken = cookieStore.get("accessToken")?.value;
    const accessToken = (await cookies()).get("accessToken")?.value;

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

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    const requestBody = {
      user_id_to: id,
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/follow/following`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(requestBody),
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendResponse.ok) {
      const errorMessage = await backendResponse.json().catch(() => ({}));
      console.log("this is follow and unfollow ", errorMessage);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendResponse.status || 400,
          message: errorMessage.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }

    const response = await backendResponse.json();
    return NextResponse.json(
      {
        status: true,
        statusCode: 200,
        message: response.message || "Follow/unfollow action successful",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        status: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}

export async function DELETE(req: Request) {
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
          status: false,
          statusCode: 401,
          message: "No access token found",
        },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id } = body;

    const userAgent = req.headers.get("user-agent") || "";
    const { fingerprint_hashed } = await fingerprintService(userAgent);

    console.log("this is id", id);

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/relationship/follow/unfollow/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Fingerprint-Hashed": fingerprint_hashed,
          "X-Request-Id": requestId,
        },
        cache: "no-cache",
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!backendResponse.ok) {
      const errorMessage = await backendResponse.json().catch(() => ({}));
      console.log("this is follow and unfollow ", errorMessage);
      return NextResponse.json(
        {
          status: false,
          statusCode: backendResponse.status || 400,
          message: errorMessage.message || `Backend API error: ${pathname}`,
        },
        { status: backendResponse.status }
      );
    }
    const response = await backendResponse.json();
    console.log("this is response from follow and unfollow", response);
    return NextResponse.json(
      {
        status: true,
        statusCode: 200,
        message: response.message || "Unfollow action successful",
        data: response.data || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        status: false,
        statusCode: 500,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  } finally {
    console.log(`${pathname}: ${requestId}`);
  }
}
