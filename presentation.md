## Decode Frontend v2 — Project Presentation

### 1) Project Overview

- **Goal**: Modern Next.js frontend for Decode Protocol: authentication, identity, and wallet linking.
- **App type**: Next.js App Router, TypeScript, Tailwind CSS.
- **Key UX**: Seamless email login/register flows, device verification, and Web3 wallet linking via AppKit.

### 2) Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript / React 18
- **Styling**: Tailwind CSS
- **State/Context**: React Context (UserInfo)
- **Wallets**: AppKit by Reown + Ethers.js
- **UI Utils**: FontAwesome, react-toastify, skeleton loader

### 3) High-level Architecture

- `src/app/` App Router pages and API routes
  - Client pages in `(app)` and `(auth)` route groups
  - API route proxies under `src/app/api/` (server actions to backend)
- `src/components/` Reusable UI components (auth cards, loading, legal)
- `src/contexts/` User context
- `src/hooks/` Reusable hooks (e.g., verification)
- `src/services/` Browser fingerprinting, password validation
- `src/utils/` API helper, cookies, errors, sanitization, toasts

### 4) Key Features to Demo

- **Email-based Authentication**
  - Login/Register detection (`/api/auth/login-or-register`)
  - Register, Login, Forgot password flows
  - Verification screen supports alphanumeric codes
- **Device & Email Verification**
  - `src/app/(auth)/verify/[type]/page.tsx`
  - Hook `useVerification` handles submission and resend
  - Flexible 6-character codes (letters and digits)
- **Dashboard**
  - Overview, News, Personal, Security, Notifications, Wallets
  - Personal Info editing with diffing against context user
  - Avatar upload with IPFS hash update
- **Wallet Linking (Web3)**
  - App-wide AppKit Provider (`AppKitRootProvider`) enables hooks on any page
  - Wallet connect + message signing with Ethers.js
  - Link challenge/validation via API routes
  - List primary and linked wallets, copy/remove actions (UI)
- **Security & Error Handling**
  - Fingerprinting (`services/fingerprint.service.ts`), request IDs
  - Strict internal request headers on API routes
  - Toasts for success/error, robust fetch timeouts

### 5) Pages and Route Groups

- `src/app/page.tsx`
  - Dynamically loads `AppKitWrapper` client-only (SSR-safe) with a loading skeleton
- `src/app/(auth)/`
  - `login/`, `register/`, `forgot-password/`, `change-password/`
  - `verify/[type]/page.tsx` unified verification flow
- `src/app/(app)/dashboard/`
  - `overview/`, `personal/`, `security/`, `notifications/`, `devices/`, `connections/`, `blog-post/`, `news/`, `wallets/`
  - `wallets/page.tsx`: Connect, link, list wallets

### 6) API Routes (Frontend proxies)

- `src/app/api/auth/*` (login/register, refresh, logout, verify, resend)
- `src/app/api/users/*` (overview, profile-change, username-change, avatar upload)
- `src/app/api/wallet/*`
  - `auth-challenge` and `auth-validation` (sign-in with wallet)
  - `link-challenge` and `link-validation` (link wallets)
  - `all-wallet` (list linked wallets)
- Patterns:
  - Enforce `X-Frontend-Internal-Request: true`
  - Include cookies/Authorization and fingerprint headers
  - Forward to `BACKEND_BASE_URL` with timeouts

### 7) Important Components

- `components/AppKitWrapper.tsx`
  - Full-screen landing + connect wallet + email login/register form
- `components/AppKitRootProvider.tsx`
  - App-wide provider for AppKit hooks
- `components/(auth)/*`
  - `AuthCard`, `TextField`, `PasswordField`, `VerificationCodeInput` (alphanumeric)
- `components/(app)/*`
  - `Navbar`, `Sidebar`, `PageHeader` for dashboard shell
- `components/(loading)/*`
  - Skeletons and fallbacks for async UI

### 8) Context and Hooks

- `contexts/UserInfoContext.tsx`: user data + `refetchUserData`
- `hooks/useVerification.ts`: verification code state, submit, resend

### 9) Utilities and Services

- `utils/api.utils.ts`: `apiCallWithTimeout`
- `utils/toast.utils.ts`: success/error/info toasts
- `utils/security-error-handling.utils.ts`: `generateRequestId`
- `services/fingerprint.service.ts`: device/browser hashing

### 10) Middleware

- `src/middleware.ts`: session and route protections (e.g., guard dashboard)

### 11) Styling and Theming

- Tailwind configuration (`tailwind.config.js`)
- Global styles (`src/app/globals.css`)
- Dark theme alignment with AppKit theme variables

### 12) Developer Experience

- ESLint setup (`eslint.config.mjs`)
- TypeScript configuration (`tsconfig.json`)
- Clear folder conventions and route groups

### 13) Environment and Config

- `NEXT_PUBLIC_REOWN_PROJECT_ID` required for AppKit
- `BACKEND_BASE_URL` for API proxying
- `PUBLIC_FRONTEND_URL` for metadata

### 14) How to Run / Demo Script

1. Install deps: `npm i`
2. Ensure env vars set (AppKit project id, backend URL)
3. Start dev: `npm run dev`
4. Demo flow:
   - Home: Email-or-username form (shows routing to login/register)
   - Auth: Register → email verification (enter 6-char code)
   - Login: Login → device verification (6-char code)
   - Dashboard → Personal: update display name/bio, upload avatar
   - Dashboard → Wallets: Connect wallet, sign link challenge, see list update

### 15) Security and Reliability Talking Points

- Internal request header checks on all frontend API routes
- Fingerprint + device/browser identification for sensitive actions
- HTTP-only cookies for tokens, short-lived access token
- Timeout and error handling on all fetches

### 15.1) Security Deep Dive (My focus)

- Authentication and Session
  - Short-lived access token in `httpOnly`, `secure`, `sameSite=lax` cookies; refresh/session token `httpOnly` with controlled TTL.
  - New-device verification with 6-character codes to protect sessions.
  - Wallet auth/linking uses signed, nonce-based challenges to prove address ownership.
- Request Integrity and Abuse Prevention
  - Mandatory `X-Frontend-Internal-Request: true` header for all frontend API routes to prevent open-proxy abuse.
  - Per-request correlation via `X-Request-ID` from `generateRequestId()` to link logs and trace incidents.
  - Aggressive timeouts (`AbortSignal.timeout`) to bound resource use.
- Client Fingerprinting
  - Hashed fingerprint + device and browser metadata forwarded to backend for anomaly detection and risk scoring.
- Data Minimization and Validation
  - Only required fields sent; payloads validated and sanitized before usage.
- Browser/Transport Protections (recommended configuration)
  - HSTS, CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy headers via middleware/edge config.
- CSRF Considerations
  - `sameSite=lax` cookies and internal header checks reduce CSRF risk; critical mutations use POST with strict server-side validation. CSRF token can be layered if needed.
- Error Hygiene
  - User-facing messages are generic; details captured server-side with request IDs. No secrets in client logs.

### 15.2) Threat Model Overview

- Credential stuffing/bruteforce: Cloudflare WAF/rate limits on `/api/auth/*`, verification throttling.
- Session theft: `httpOnly` cookies, device verification, short access-token TTL.
- Replay attacks on wallet auth: Nonce-based signed messages with short expiry.
- API abuse via proxy: Internal header + backend auth + fingerprint checks.
- DoS/DDoS: Cloudflare edge protection; origin timeouts and minimal work per request.

### 15.3) Deployment & Edge Security (DigitalOcean + Cloudflare + name.com)

- Domain/DNS
  - Domain purchased at name.com; nameservers pointed to Cloudflare; DNS proxied (orange-cloud) to mask origin IP.
- TLS/HTTPS
  - Cloudflare Universal SSL at edge; Full (strict) TLS to DigitalOcean origin with Let’s Encrypt certs.
  - Add HSTS (include subdomains) once stable; consider preload.
- Cloudflare Config
  - WAF managed rules (OWASP), Bot Fight, Custom rules and Rate Limiting for `/api/*`.
  - Optional Turnstile Captcha for abusive flows (excess verification/resend).
  - Cache rules: static assets cached; API routes bypass cache.
- DigitalOcean Origin
  - App Platform or hardened Droplet; firewall only allows 80/443 from Cloudflare IP ranges; SSH restricted.
  - Env vars stored as DO secrets; process supervision; log shipping.
- CI/CD & Secrets
  - Keep `NEXT_PUBLIC_REOWN_PROJECT_ID`, `BACKEND_BASE_URL`, `PUBLIC_FRONTEND_URL` in env.
  - Plan for key rotation and emergency revoke.

### 16) Known Limitations / Next Steps

- Remove wallet action not wired to backend yet (UI present)
- Improve ENS/Name Service resolution UI
- Add tests and more robust loading states in dashboard pages

### 17) Q&A Prep

- Why dynamic import on `page.tsx`? To avoid SSR issues with wallet libraries
- Why 6-character verification? Flexibility with letters/digits
- Where is provider mounted? `AppKitRootProvider` in `app/layout.tsx`
- How are backend calls secured? Internal headers, cookies, fingerprints, request IDs
