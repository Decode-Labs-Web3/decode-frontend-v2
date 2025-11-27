# Decode Frontend v2 — Project Overview, Features, and Tech Stack

This document summarizes the architecture, features, and technologies implemented in the project to support proposals, reports, and stakeholder communication.

## **Overview**

- A modern Next.js 16 (App Router) application built with TypeScript and React 19.
- Secure account center for the Decode Network with multi-channel authentication, wallet integration, device trust, notifications, and user profile management.
- UI built with Tailwind CSS v4 and shadcn/ui (Radix UI) for accessible, consistent components.

## **High-Level Architecture**

- **Frontend Framework**: Next.js 16 App Router with server and client components.
- **API Layer**: Serverless route handlers in `src/app/api/**/route.ts` for auth, wallets, users, blogs, interests, notifications, and 2FA.
- **Providers/Contexts**:
  - `AppKitProvider` (Reown AppKit + Ethers adapter) for wallet connectivity.
  - `NotificationProvider` for unread count and toasts.
  - `UserInfoContext` for user data access across dashboard views.
- **State & Data Flow**:
  - Client-side fetch to API routes with `credentials: 'include'` and internal request headers.
  - Cookies for session gates and device fingerprint propagation.
  - SSE via EventSource for real-time notifications.
- **Security**:
  - Challenge–response wallet authentication (EVM) with message signing (Ethers v6).
  - 2FA endpoints, OTP verifications, device fingerprint trust flow, session/device revoke.
- **Data Access**:
  - MongoDB client utility (`src/lib/mongodb.lib.ts`) with lazy client initialization and db getter.

## **Key Features**

### **Authentication & Authorization**

- Email/username + password login and registration.
- OTP verification flows: register, login, forgot, fingerprint verification.
- Forgot password + change password.
- Device fingerprint trust/check and login verification gate.
- Account deactivation/reactivation flow with confirmation modal.
- SSO endpoint and page (`/sso`).

Associated API routes (non-exhaustive):

- `api/auth/login`, `api/auth/register`, `api/auth/logout`, `api/auth/refresh`
- `api/auth/login-or-register` (smart entry: directs to login or register)
- `api/auth/forgot-password`, `api/auth/change-password`
- `api/auth/verify-otp`, `api/auth/verify-register`, `api/auth/verify-forgot`, `api/auth/verify-login`, `api/auth/verify-fingerprint`
- `api/auth/sso`, `api/auth/revoke-session`, `api/auth/revoke-device`, `api/auth/fingerprints`

### **Two-Factor Authentication (2FA)**

- Endpoints for setup, enable, disable, and status:
  - `api/2fa/setup`, `api/2fa/enable`, `api/2fa/disable`, `api/2fa/status`

### **Wallet Integration (EVM)**

- Reown AppKit + Ethers adapter for wallet connection (mainnet, arbitrum).
- Challenge/verify signing flow for wallet-based authentication:
  - `api/wallet/auth-challenge`, `api/wallet/auth-validation`
- Wallet management:
  - Link/unlink: `api/wallet/link-challenge`, `api/wallet/link-validation`, `api/wallet/unlink-wallet`
  - Primary wallet: `api/wallet/primary-challenge`, `api/wallet/primary-validation`
  - List wallets: `api/wallet/all-wallet`

### **User Profile & Social**

- Profile overview with avatar, display name, bio, roles, and user ID.
- Avatar upload to IPFS hash, profile edits, and email change with modals.
- Follow/following, relationships, search, block/unblock.
- Snapshot chart visualization for user activity/stats.

Associated API routes:

- `api/users/overview`, `api/users/detail`, `api/users/profile-change`, `api/users/email-change`, `api/users/avatar`
- `api/users/search`, `api/users/relationship`
- `api/users/follow`, `api/users/follow-and-unfollow`, `api/users/block-and-unblock`
- `api/users/deactivate`, `api/users/reactivate`
- `api/users/snapshot`

### **Notifications & Realtime**

- SSE (`/api/users/websocket`) used to receive realtime notifications.
- Unread count context and badge integration.
- Toasts for info/success/error using `react-toastify` helpers in `src/utils/toast.utils.ts`.

Associated API routes:

- `api/users/notifications`, `api/users/unread`, `api/users/read`, `api/users/read-all`

### **Devices & Security**

- Devices page lists fingerprints and device info; actions to revoke devices/sessions.
- Fingerprint hashing service with audio/browser/OS/timezone inputs (`src/services/fingerprint.services.ts`).

### **Content & Blogs**

- Blog post creation and blog APIs: `api/blogs/post`, `api/blogs/blog`, `api/blogs/ping`.
- News and notifications cards with loading skeletons.

### **Interests**

- Interest APIs: `api/interest/create-interest`, `api/interest/get-interest`, `api/interest/same-interest`.

### **Legal & Compliance**

- Terms and Privacy pages with dynamic slug support under `terms-and-privacy`.
- Legal content components providing structured, styled legal UI.

### **SSO**

- SSO page (`/sso`) and server route `api/auth/sso` for provider-driven auth flows.

## **UI/UX System**

- **Design System**: Tailwind CSS v4 using CSS variables (e.g., `bg-card`) for theme surfaces.
- **Component Library**: shadcn/ui built on Radix UI primitives for accessibility.
- **Installed/Used shadcn components**:
  - Core: `button`, `card`, `input`, `label`, `badge`, `separator`, `skeleton`, `switch`, `tabs`, `textarea`, `tooltip`, `dialog`, `sheet`, `hover-card`, `select`, `avatar`.
  - Extended: `alert`, `alert-dialog`, `form`, `collapsible`, `command`, `progress`.
- **Icons**: FontAwesome (primary), Lucide available.
- **Feedback**: Toasts with `react-toastify` via utility wrappers.

## **Routing Map (Selected)**

- Public: `/`, `/login`, `/register`, `/forgot-password`, `/sso`, all OTP/verify flows.
- Dashboard (protected): `/dashboard` with sections `overview`, `personal`, `security`, `wallets`, `devices`, `news`, `notifications`, `connections`, `blog-post` and nested dynamic routes for connections.
- Legal: `/terms-and-privacy/terms`, `/terms-and-privacy/privacy`, and other slugs via `[...slug]`.
- API: Comprehensive set under `src/app/api/**/route.ts` (see sections above).

## **Security Practices**

- Cookies set with `SameSite=Lax`, short-lived gate cookies to navigate guarded pages.
- Wallet signing via Ethers BrowserProvider with explicit user consent and rejection handling.
- Abortable fetch with timeouts to avoid hanging requests (`AbortSignal.timeout(...)`).
- Device fingerprint hashing (SHA-256) from multi-signal payload; server checks trust.
- Account deactivation flow with confirmation and reactivation API.

## **State Management & Contexts**

- `NotificationContext` manages unread counts and refresh.
- `UserInfoContext` shares user profile and refresh function across dashboard.
- Local state for modals and form interactions; dynamic imports for modals to reduce bundle size.

## **Data & Utilities**

- **MongoDB**: Centralized connection promise and db getter in `src/lib/mongodb.lib.ts`.
- **Utilities**: Cookie helpers, route helpers, toast helpers.
- **Charts**: `recharts` used in `SnapshotChart` for visualizations.
- **Dates**: `date-fns` for formatting/manipulation.

## **Build, Tooling & Quality**

- **Build**: Next.js 16 with Turbopack; production-ready `next build`.
- **TypeScript**: Strict type-check pipeline (`npm run type-check`, `tsc --noEmit`).
- **Linting**: ESLint 9 + `eslint-config-next`.
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`, `class-variance-authority`.

## **Deployment**

- `vercel.json` included (Vercel-ready). Next.js 16 app router layout and static optimization compatible with Vercel.

## **Notable Implementation Details**

- Dynamic import of `AppKitWrapper` on the home page to avoid SSR wallet issues.
- `AppKitProvider` configured with `mainnet` and `arbitrum` and project metadata.
- Accessible semantics preserved (`nav`, `aside`, proper headings), with shadcn/ui replacing raw HTML elements where possible.
- Reusable modals: `ProfileEditModal`, `EmailChangeModal`, `DeleteAccountModal` with shadcn `Dialog`.
- Real-time notifications via SSE; unread badge in sidebar; toasts on incoming messages.

## **How to Run**

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Type-check only
npm run type-check

# Production build
npm run build
npm start
```

## **Future Enhancements (Suggested)**

- Adopt `react-hook-form` + `zod` schemas across all forms for validation consistency.
- Centralize API client with typed responses and error mapping.
- Add e2e tests (Playwright) for auth and wallet flows.
- Add skeletons/placeholders to remaining views for perceived performance.
- Consider Web Push for notifications in addition to SSE.

---

This document reflects the current repository at commit time and may evolve with subsequent changes.
