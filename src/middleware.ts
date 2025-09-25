import { NextRequest, NextResponse } from "next/server";

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
    prefix: "/register",
    cookie: "gate-key-for-register",
    exact: false,
  },
  {
    prefix: "/forgot-password",
    cookie: "gate-key-for-forgot-password",
    exact: false,
  },
  {
    prefix: "/change-password",
    cookie: "gate-key-for-change-password",
    exact: false,
  },
];

// Handle gate rules for specific routes, checking for required cookies and clearing them after use
function handleGate( request: NextRequest, pathname: string ): NextResponse | null {
  if (pathname.startsWith("/verify/")) {
    const verifyType = pathname.split("/")[2];
    let requiredCookie = "";

    switch (verifyType) {
      case "login":
        requiredCookie = "gate-key-for-verify-login";
        break;
      case "register":
        requiredCookie = "gate-key-for-verify-register";
        break;
      case "forgot":
        requiredCookie = "gate-key-for-verify-forgot";
        break;
      default:
        return NextResponse.redirect(new URL("/", request.url));
    }

    const ok = request.cookies.get(requiredCookie)?.value === "true";
    if (!ok) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const res = NextResponse.next();
    res.cookies.set(requiredCookie, "", { maxAge: 0, path: "/" });
    return res;
  }

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

// Check if a JWT token is still valid & return TTL (seconds)
function getJwtRemainingSeconds(
  token: string,
  skewSeconds = 10
): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));

    const exp = Number(json.exp);
    if (!exp || Number.isNaN(exp)) return null;

    const now = Math.floor(Date.now() / 1000);
    const remaining = exp - now - skewSeconds;

    return Math.max(0, remaining);
  } catch {
    return null;
  }
}

// Main middleware function for handling authentication, gate rules, and API/dashboard access
export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  if (
    pathname === "/" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/api") ||
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

  // Handle gate rules for certain routes
  const gated = handleGate(request, pathname);
  if (gated) return gated;

  // Special handling for API routes
  if (pathname.startsWith("/api")) {
    const mode = request.headers.get("sec-fetch-mode") || "";
    const dest = request.headers.get("sec-fetch-dest") || "";
    const userNav = request.headers.get("sec-fetch-user") === "?1";
    const internal =
      request.headers.get("X-Frontend-Internal-Request") === "true";

    if (internal) return NextResponse.next();

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

  // Handle dashboard authentication and token refresh
  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const remaining = accessToken ? getJwtRemainingSeconds(accessToken) : null;
    const expired = (remaining ?? 0) <= 0;

    if (accessToken && !expired) {
      return NextResponse.next();
    }
    try {
      // Attempt to refresh tokens if access token is missing or expired
      const response = await fetch(`${origin}/api/auth/refresh`, {
        method: "GET",
        headers: {
          "X-Frontend-Internal-Request": "true",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      const {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        _id: newSessionId,
        expires_at: newExpiresAt,
      } = await response.json();
      const res = NextResponse.next();

      if (newSessionId) {
        res.cookies.set("sessionId", newSessionId, {
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15,
        });
      }

      const accessTokenAge = getJwtRemainingSeconds(newAccessToken);

      if (newAccessToken) {
        res.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: accessTokenAge ?? 60 * 15,
        });
      }

      const refreshTokenAge = Math.floor(
        (new Date(newExpiresAt).getTime() - Date.now()) / 1000
      );

      if (newRefreshToken) {
        res.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: refreshTokenAge > 0 ? refreshTokenAge : 0,
        });
      }

      return res;
    } catch (error) {
      console.error("Refresh token error:", error);
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Default redirect to home for all other cases
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|favicons/|fonts/).*)",
  ],
};
