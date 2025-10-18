import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authExpire, httpStatus } from "@/constants/index.constants";
import {
  generateRequestId,
  guardInternal,
  apiPathName,
} from "@/utils/index.utils";

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const pathname = apiPathName(req);
  const denied = guardInternal(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const { otp } = body;

    // console.log("this is otp form", otp)

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.BAD_REQUEST,
          message: "Code is required",
        },
        { status: httpStatus.BAD_REQUEST }
      );
    }

    // const cookieStore = await cookies();
    // const login_session_token = cookieStore.get("login_session_token")?.value;
    const login_session_token = (await cookies()).get(
      "login_session_token"
    )?.value;

    if (!login_session_token) {
      return NextResponse.json(
        {
          success: false,
          statusCode: httpStatus.UNAUTHORIZED,
          message: "No access token found",
        },
        { status: httpStatus.UNAUTHORIZED }
      );
    }

    const resquestBody = {
      login_session_token,
      otp,
    };

    const backendResponse = await fetch(
      `${process.env.BACKEND_BASE_URL}/auth/2fa/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": requestId,
        },
        body: JSON.stringify(resquestBody),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );

    // console.log(`${pathname} error:`, backendResponse);

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => null);
      console.error(`${pathname} error:`, error);
      return NextResponse.json(
        {
          success: false,
          statusCode: backendResponse.status || httpStatus.BAD_REQUEST,
          message: error?.message || "Invalid email verification otp",
        },
        { status: backendResponse.status || httpStatus.BAD_REQUEST }
      );
    }

    const response = await backendResponse.json();
    // console.log(`${pathname} :`, response);

    if (
      response.success &&
      response.statusCode === 200 &&
      response.message === "Login successful"
    ) {
      const res = NextResponse.json({
        success: true,
        statusCode: response.statusCode || httpStatus.OK,
        message: response.message || "Login successful",
      });

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.sessionToken,
      });

      res.cookies.set("accessToken", response.data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.accessToken,
      });

      res.cookies.set(
        "accessExp",
        String(Math.floor(Date.now() / 1000) + authExpire.accessToken),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: authExpire.accessToken,
        }
      );

      res.cookies.set("refreshToken", response.data.session_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.refreshToken,
      });

      return res;
    }

    return NextResponse.json(
      {
        success: false,
        statusCode: response.statusCode || httpStatus.BAD_REQUEST,
        message: response.message || "Login failed",
      },
      { status: httpStatus.BAD_REQUEST }
    );
  } catch (error) {
    console.error(`${pathname} error:`, error);
    return NextResponse.json(
      {
        success: false,
        statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Server error from login",
      },
      { status: httpStatus.INTERNAL_SERVER_ERROR }
    );
  } finally {
    console.info(`${pathname}: ${requestId}`);
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      statusCode: httpStatus.METHOD_NOT_ALLOWED,
      message: "Method Not Allowed",
    },
    { status: httpStatus.METHOD_NOT_ALLOWED }
  );
}
