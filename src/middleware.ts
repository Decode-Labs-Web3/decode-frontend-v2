import { NextRequest, NextResponse } from "next/server";

type GateRule = {
  prefix: string;
  cookie: string;
  path?: string;
  exact?: boolean;
};

const GATE_RULES: GateRule[] = [
  { prefix: "/login", cookie: "gate-key-for-login", exact: false },
  { prefix: "/verify-login", cookie: "gate-key-for-verify-login", exact: false },
  { prefix: "/register", cookie: "gate-key-for-register", exact: false },
  { prefix: "/verify-register", cookie: "gate-key-for-verify-register", exact: false },
  { prefix: "/forgot-password", cookie: "gate-key-for-forgot-password", exact: false },
  { prefix: "/verify-forgot", cookie: "gate-key-for-verify-forgot", exact: false },
  { prefix: "/change-password", cookie: "gate-key-for-change-password", exact: false },
];

function handleGate(request: NextRequest, pathname: string): NextResponse | null {
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
    res.cookies.set(rule.cookie, "", { maxAge: 0, path: rule.path ?? rule.prefix });
    return res;
  }
  return null;
}

function isJwtExpired(token: string): boolean {
  try {
    const skewSec = 10;
    const payload = token.split(".")[1];
    if (!payload) return true;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded));
    const expirationTime = Number(json.exp) || 0;
    const now = Math.floor(Date.now() / 1000);
    return now + skewSec >= expirationTime;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    return NextResponse.next();
  }

  const gated = handleGate(request, pathname);
  if (gated) return gated;

  if (pathname.startsWith("/api")) {
    const mode = request.headers.get("sec-fetch-mode") || "";
    const dest = request.headers.get("sec-fetch-dest") || "";
    const userNav = request.headers.get("sec-fetch-user") === "?1";
    const internal = request.headers.get("frontend-internal-request") === "true";

    if (internal) return NextResponse.next();

    const isNavigation = mode === "navigate" || dest === "document" || userNav;
    if (isNavigation) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return new NextResponse("Missing Frontend-Internal-Request header", { status: 400 });
  }

  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (accessToken && !isJwtExpired(accessToken)) {
      return NextResponse.next();
    }
    try {
      const response = await fetch(`${origin}/api/auth/refresh`, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          "frontend-internal-request": "true",
        },
        cache: "no-store",
      });


      if (!response.ok) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
      const res = NextResponse.next();

      if (newAccessToken) {
        res.cookies.set("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 15,
        });
      }
      if (newRefreshToken) {
        res.cookies.set("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        });
      }
      return res;
    } catch (error) {
      console.error('Refresh token error:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
