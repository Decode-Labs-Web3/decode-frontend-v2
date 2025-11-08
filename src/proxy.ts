import { NextRequest, NextResponse } from "next/server";
import { authExpire } from "@/constants/index.constants";

type GateRule = {
  prefix: string;
  cookie: string;
  path?: string;
  exact?: boolean;
};

const GATE_RULES: GateRule[] = [
  {
    prefix: "/login",
    cookie: "gate-key-for-login",
    exact: false,
  },
  {
    prefix: "/verify-login",
    cookie: "gate-key-for-verify-login",
    exact: false,
  },
  {
    prefix: "/register",
    cookie: "gate-key-for-register",
    exact: false,
  },
  {
    prefix: "/verify-register",
    cookie: "gate-key-for-verify-register",
    exact: false,
  },
  {
    prefix: "/forgot-password",
    cookie: "gate-key-for-forgot-password",
    exact: false,
  },
  {
    prefix: "/verify-forgot",
    cookie: "gate-key-for-verify-forgot",
    exact: false,
  },
  {
    prefix: "/verify-otp",
    cookie: "gate-key-for-verify-otp",
    exact: false,
  },
  {
    prefix: "/verify-fingerprint",
    cookie: "gate-key-for-verify-fingerprint",
    exact: false,
  },
  {
    prefix: "/change-password",
    cookie: "gate-key-for-change-password",
    exact: false,
  },
];

function handleGate(
  request: NextRequest,
  pathname: string
): NextResponse | null {
  for (const rule of GATE_RULES) {
    const match = rule.exact
      ? pathname === rule.prefix
      : pathname === rule.prefix || pathname.startsWith(rule.prefix + "/");

    if (!match) continue;

    const ok = request.cookies.get(rule.cookie)?.value === "true";
    if (!ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const res = NextResponse.next();
    res.cookies.set(rule.cookie, "", {
      maxAge: 0,
      path: rule.path ?? rule.prefix,
    });
    return res;
  }
  return null;
}

function getRemainingFromAccessExpCookie(
  request: NextRequest,
  skewSeconds = 10
): number {
  const expStr = request.cookies.get("accessExp")?.value;
  if (!expStr) return -1;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return -1;
  const now = Math.floor(Date.now() / 1000);
  return exp - now - skewSeconds;
}

async function refreshTokens(
  request: NextRequest,
  origin: string
): Promise<{ success: boolean; response?: NextResponse }> {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  if (!refreshToken) return { success: false };

  try {
    const apiResponse = await fetch(`${origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Frontend-Internal-Request": "true",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ session_token: refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!apiResponse.ok) return { success: false };

    const response = await apiResponse.json();
    if (response.success && response.statusCode === 200) {
      const res = NextResponse.next();

      res.cookies.set("sessionId", response.data._id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: authExpire.accessToken,
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

      return { success: true, response: res };
    }
  } catch (error) {
    console.error("Token refresh error:", error);
  }
  return { success: false };
}

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/sso") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/fonts") ||
    pathname.startsWith("/public") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/favicons") ||
    pathname.startsWith("/terms-and-privacy")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    if (pathname === "/api/users/websocket") {
      return NextResponse.next();
    }

    const mode = request.headers.get("sec-fetch-mode") || "";
    const dest = request.headers.get("sec-fetch-dest") || "";
    const userNav = request.headers.get("sec-fetch-user") === "?1";
    const internal =
      request.headers.get("X-Frontend-Internal-Request") === "true";

    if (internal) {
      const refreshToken = request.cookies.get("refreshToken")?.value;
      if (refreshToken) {
        const remaining = getRemainingFromAccessExpCookie(request);
        if (remaining <= 0) {
          const refreshResult = await refreshTokens(request, origin);
          if (refreshResult.success && refreshResult.response) {
            return refreshResult.response;
          } else {
            return NextResponse.json(
              {
                success: false,
                statusCode: 401,
                message: "Session expired, please login again",
              },
              { status: 401 }
            );
          }
        }
      }
      return NextResponse.next();
    }

    const isNavigation = mode === "navigate" || dest === "document" || userNav;
    if (isNavigation) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.json(
      {
        success: false,
        statusCode: 400,
        message: "Missing X-Frontend-Internal-Request header",
      },
      { status: 400 }
    );
  }

  const gated = handleGate(request, pathname);
  if (gated) return gated;

  if (pathname === "/") {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const remaining = getRemainingFromAccessExpCookie(request);
      const stillValid = !!accessToken && remaining > 0;

      if (stillValid) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      const refreshResult = await refreshTokens(request, origin);
      if (refreshResult.success && refreshResult.response) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      const res = NextResponse.next();
      ["accessToken", "accessExp", "refreshToken", "sessionId"].forEach(
        (name) => {
          if (request.cookies.get(name)) {
            res.cookies.set(name, "", { maxAge: 0, path: "/" });
          }
        }
      );
      return res;
    }

    return NextResponse.next();
  }

  // Handle dashboard authentication and token refresh
  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const remaining = getRemainingFromAccessExpCookie(request);
    const stillValid = !!accessToken && remaining > 0;
    if (stillValid) return NextResponse.next();

    const refreshResult = await refreshTokens(request, origin);
    if (refreshResult.success && refreshResult.response) {
      return refreshResult.response;
    }
    const failRes = NextResponse.redirect(new URL("/", request.url));
    ["accessToken", "accessExp", "refreshToken", "sessionId"].forEach(
      (name) => {
        if (request.cookies.get(name)) {
          failRes.cookies.set(name, "", { maxAge: 0, path: "/" });
        }
      }
    );
    return failRes;
  }

  if (pathname === "/") return NextResponse.next();
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|favicons/|fonts/).*)",
  ],
};
