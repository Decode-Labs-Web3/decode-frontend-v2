import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { generateRequestId, guardInternal, apiPathName} from "@/utils/index.utils"

export async function POST(req: Request) {
  const requestId = generateRequestId()
  const pathname = apiPathName(req)
  const denied = guardInternal(req)
  if(denied) return denied

  try {
    // const cookieStore = await cookies();
    // const refreshToken = cookieStore.get("refreshToken")?.value;
    const refreshToken = (await cookies()).get("accessToken")?.value

    const requestBody = {
      session_token: refreshToken,
    };

    const backendRes = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/session/logout`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId
        },
        body: JSON.stringify(requestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!backendRes.ok) {
      const err = await backendRes.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendRes.status || 401,
          message: err?.message || "Logout failed",
        },
        { status: backendRes.status || 401 }
      );
    }

    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("sessionId");
    cookieStore.delete("accessExp");

    return NextResponse.json(
      {
        success: true,
        statusCode: 200,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("/api/auth/logout handler error:", error);
    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : "Failed to logout",
      },
      { status: 500 }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: 405,
      message: "Method Not Allowed",
    },
    { status: 405 }
  );
}
