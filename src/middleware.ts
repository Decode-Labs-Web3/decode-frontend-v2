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

function isoToMaxAgeSeconds(expiresAtISO: string): number {
  const now = Date.now();
  const expMs = Date.parse(expiresAtISO);
  return Math.max(0, Math.floor((expMs - now) / 1000));
}

// Helper function to set authentication cookies
function setAuthCookies(
  response: NextResponse,
  data: {
    _id: string;
    access_token: string;
    session_token: string;
    expires_at: string;
  }
) {
  const accessExpISO = data.expires_at as string;
  const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
  const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);

  response.cookies.set("sessionId", data._id, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  response.cookies.set("accessToken", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  response.cookies.set("accessExp", String(accessExpSec), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });

  response.cookies.set("refreshToken", data.session_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

// Handle gate rules for specific routes, checking for required cookies and clearing them after use
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

// Check if a JWT token is still valid
function getRemainingFromAccessExpCookie(
  request: NextRequest,
  skewSeconds = 10
): number {
  const expStr = request.cookies.get("accessExp")?.value; // "1761631300"
  if (!expStr) return -1;
  const exp = Number(expStr);
  if (!Number.isFinite(exp)) return -1;
  const now = Math.floor(Date.now() / 1000);
  return exp - now - skewSeconds;
}

// Main middleware function for handling authentication, gate rules, and API/dashboard access
export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // Handle static files and public routes first
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
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

  // Special handling for API routes
  if (pathname.startsWith("/api")) {
    if (pathname === "/api/users/websocket") {
      return NextResponse.next();
    }

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

  // Handle gate rules for certain routes
  const gated = handleGate(request, pathname);
  if (gated) return gated;

  // Check if user is already authenticated and trying to access home page
  if (pathname === "/") {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (refreshToken) {
      const remaining = getRemainingFromAccessExpCookie(request);
      const stillValid = !!accessToken && remaining > 0;

      if (stillValid) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }

      try {
        const apiResponse = await fetch(`${origin}/api/auth/refresh`, {
          method: "GET",
          headers: { "X-Frontend-Internal-Request": "true" },
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        });
        if (!apiResponse.ok)
          return NextResponse.redirect(new URL("/", request.url));

        const response = await apiResponse.json();
        const res = NextResponse.redirect(new URL("/dashboard", request.url));
        setAuthCookies(res, response.data);
        return res;
      } catch {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  }

  // Handle dashboard authentication and token refresh
  if (pathname.startsWith("/dashboard")) {
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) return NextResponse.redirect(new URL("/", request.url));

    const remaining = getRemainingFromAccessExpCookie(request);
    const stillValid = !!accessToken && remaining > 0;
    if (stillValid) return NextResponse.next();

    try {
      const apiResponse = await fetch(`${origin}/api/auth/refresh`, {
        method: "GET",
        headers: { "X-Frontend-Internal-Request": "true" },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (!apiResponse.ok)
        return NextResponse.redirect(new URL("/", request.url));

      const response = await apiResponse.json();
      const res = NextResponse.next();
      setAuthCookies(res, response.data);
      return res;
    } catch {
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

// const middleware = async (request: NextRequest) => {
//   const { pathname } = request.nextUrl;
//   if (pathname.startsWith("/api")) {
//     return NextResponse.json({ ok: false }, { status: 400 });
//   }
//   if (pathname === "/") {
//     return NextResponse.next();
//   }
//   return NextResponse.redirect(new URL("/", request.url));
// };

// import { NextRequest, NextResponse } from "next/server";

// type GateRule = {
//   prefix: string;
//   cookie: string;
//   path?: string;
//   exact?: boolean;
// };

// const GATE_RULES: GateRule[] = [
//   {
//     prefix: "/login",
//     cookie: "gate-key-for-login",
//     exact: false,
//   },
//   {
//     prefix: "/register",
//     cookie: "gate-key-for-register",
//     exact: false,
//   },
//   {
//     prefix: "/forgot-password",
//     cookie: "gate-key-for-forgot-password",
//     exact: false,
//   },
//   {
//     prefix: "/change-password",
//     cookie: "gate-key-for-change-password",
//     exact: false,
//   },
// ];

// function isoToMaxAgeSeconds(expiresAtISO: string): number {
//   const now = Date.now();
//   const expMs = Date.parse(expiresAtISO);
//   return Math.max(0, Math.floor((expMs - now) / 1000));
// }

// // Handle gate rules for specific routes, checking for required cookies and clearing them after use
// function handleGate(
//   request: NextRequest,
//   pathname: string
// ): NextResponse | null {
//   if (pathname.startsWith("/verify/")) {
//     const verifyType = pathname.split("/")[2];
//     let requiredCookie = "";

//     switch (verifyType) {
//       case "login":
//         requiredCookie = "gate-key-for-verify-login";
//         break;
//       case "register":
//         requiredCookie = "gate-key-for-verify-register";
//         break;
//       case "forgot":
//         requiredCookie = "gate-key-for-verify-forgot";
//         break;
//       default:
//         return NextResponse.redirect(new URL("/", request.url));
//     }

//     const ok = request.cookies.get(requiredCookie)?.value === "true";
//     if (!ok) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     const res = NextResponse.next();
//     res.cookies.set(requiredCookie, "", { maxAge: 0, path: "/" });
//     return res;
//   }

//   for (const rule of GATE_RULES) {
//     const match = rule.exact
//       ? pathname === rule.prefix
//       : pathname === rule.prefix || pathname.startsWith(rule.prefix + "/");

//     if (!match) continue;

//     const ok = request.cookies.get(rule.cookie)?.value === "true";
//     if (!ok) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     const res = NextResponse.next();
//     res.cookies.set(rule.cookie, "", {
//       maxAge: 0,
//       path: rule.path ?? rule.prefix,
//     });
//     return res;
//   }
//   return null;
// }

// // Check if a JWT token is still valid
// function getRemainingFromAccessExpCookie(
//   request: NextRequest,
//   skewSeconds = 10
// ): number {
//   const expStr = request.cookies.get("accessExp")?.value; // "1761631300"
//   if (!expStr) return -1;
//   const exp = Number(expStr);
//   if (!Number.isFinite(exp)) return -1;
//   const now = Math.floor(Date.now() / 1000);
//   return exp - now - skewSeconds;
// }

// // Main middleware function for handling authentication, gate rules, and API/dashboard access
// export async function middleware(request: NextRequest) {
//   const { pathname, origin } = request.nextUrl;

//   if (
//     pathname === "/" ||
//     pathname === "/robots.txt" ||
//     pathname === "/sitemap.xml" ||
//     pathname.startsWith("/api") ||
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/fonts") ||
//     pathname.startsWith("/public") ||
//     pathname.startsWith("/images") ||
//     pathname.startsWith("/favicon") ||
//     pathname.startsWith("/favicons") ||
//     pathname.startsWith("/terms-and-privacy")
//   ) {
//     return NextResponse.next();
//   }

//   // Handle gate rules for certain routes
//   const gated = handleGate(request, pathname);
//   if (gated) return gated;

//   // Special handling for API routes
//   if (pathname.startsWith("/api")) {
//     const mode = request.headers.get("sec-fetch-mode") || "";
//     const dest = request.headers.get("sec-fetch-dest") || "";
//     const userNav = request.headers.get("sec-fetch-user") === "?1";
//     const internal =
//       request.headers.get("X-Frontend-Internal-Request") === "true";

//     if (internal) return NextResponse.next();

//     const isNavigation = mode === "navigate" || dest === "document" || userNav;
//     if (isNavigation) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     return NextResponse.json(
//       {
//         success: false,
//         statusCode: 400,
//         message: "Missing X-Frontend-Internal-Request header",
//       },
//       { status: 400 }
//     );
//   }

//   // Handle dashboard authentication and token refresh
//   if (pathname.startsWith("/dashboard")) {
//     const accessToken = request.cookies.get("accessToken")?.value;
//     const refreshToken = request.cookies.get("refreshToken")?.value;

//     if (!refreshToken) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }

//     const remaining = getRemainingFromAccessExpCookie(request); // giây còn lại
//     const stillValid = !!accessToken && remaining > 0;

//     if (stillValid) {
//       return NextResponse.next();
//     }

//     try {
//       // Attempt to refresh tokens if access token is missing or expired
//       const apiResponse = await fetch(`${origin}/api/auth/refresh`, {
//         method: "GET",
//         headers: {
//           "X-Frontend-Internal-Request": "true",
//         },
//         cache: "no-store",
//         signal: AbortSignal.timeout(10000),
//       });

//       if (!apiResponse.ok) {
//         return NextResponse.redirect(new URL("/", request.url));
//       }

//       const response = await apiResponse.json();
//       const res = NextResponse.next();

//       const accessExpISO = response.data.expires_at as string;
//       const accessMaxAge = isoToMaxAgeSeconds(accessExpISO);
//       const accessExpSec = Math.floor(Date.parse(accessExpISO) / 1000);

//       res.cookies.set("sessionId", response.data._id, {
//         httpOnly: false,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: 60 * 15,
//       });

//       res.cookies.set("accessToken", response.data.access_token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: accessMaxAge,
//       });

//       res.cookies.set("accessExp", String(accessExpSec), {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: accessMaxAge,
//       });

//       res.cookies.set("refreshToken", response.data.session_token, {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//         path: "/",
//         maxAge: 60 * 60 * 24 * 7,
//       });

//       return res;
//     } catch (error) {
//       console.error("Refresh token error:", error);
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   // Default redirect to home for all other cases
//   return NextResponse.redirect(new URL("/", request.url));
// }

// export const config = {
//   matcher: [
//     "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|images/|favicons/|fonts/).*)",
//   ],
// };
