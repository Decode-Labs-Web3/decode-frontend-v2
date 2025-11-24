# Authentication Flow Sequence Diagrams

This document contains sequence diagrams for all authentication flows in the Decode Frontend application.

## 1. Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Register Page
    participant API as /api/auth/register
    participant Backend as Backend API
    participant Email as Email Service
    participant VerifyUI as Verify Register Page
    participant VerifyAPI as /api/auth/verify-register

    User->>UI: Enter credentials (username, email, password)
    UI->>UI: Validate password strength
    User->>UI: Submit registration form
    UI->>API: POST /api/auth/register
    API->>Backend: POST /auth/register/email-verification
    Backend->>Email: Send verification code
    Backend-->>API: 200 OK (Email verification sent)
    API->>API: Set cookies (gate-key, registration_data)
    API-->>UI: Success response
    UI->>VerifyUI: Redirect to /verify-register

    User->>VerifyUI: Enter 6-digit code
    VerifyUI->>VerifyAPI: POST /api/auth/verify-register
    VerifyAPI->>Backend: POST /auth/register/verify-email
    Backend->>Backend: Validate code & create user
    Backend-->>VerifyAPI: 200 OK (User created)
    VerifyAPI-->>VerifyUI: Success response
    VerifyUI->>UI: Redirect to /login
    VerifyUI->>User: Show success toast
```

## 2. Login Flow (Standard - Trusted Device)

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant API as /api/auth/login
    participant FP as Fingerprint Service
    participant Backend as Backend API
    participant Dashboard as Dashboard

    User->>UI: Enter email/username & password
    User->>UI: Submit login form
    UI->>FP: Generate device fingerprint
    FP-->>UI: Fingerprint hash
    UI->>API: POST /api/auth/login (with fingerprint)
    API->>FP: Extract device & browser info
    API->>Backend: POST /auth/login (credentials + fingerprint)
    Backend->>Backend: Validate credentials
    Backend->>Backend: Check if device is trusted
    Backend-->>API: 200 OK (Login successful)
    API->>API: Set auth cookies (sessionId, accessToken, refreshToken)
    API-->>UI: Success response
    UI->>Dashboard: Redirect to /dashboard
    UI->>User: Show success toast
```

## 3. Login Flow (Untrusted Device - Email Verification)

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant API as /api/auth/login
    participant Backend as Backend API
    participant Email as Email Service
    participant VerifyUI as Verify Login Page
    participant VerifyAPI as /api/auth/verify-login
    participant Dashboard as Dashboard

    User->>UI: Enter credentials
    UI->>API: POST /api/auth/login (with fingerprint)
    API->>Backend: POST /auth/login
    Backend->>Backend: Detect untrusted device
    Backend->>Email: Send verification code
    Backend-->>API: 400 (Device fingerprint not trusted)
    API->>API: Set gate-key-for-verify-login cookie
    API-->>UI: Verification required response
    UI->>VerifyUI: Redirect to /verify-login

    User->>VerifyUI: Enter 6-digit code
    VerifyUI->>VerifyAPI: POST /api/auth/verify-login
    VerifyAPI->>Backend: POST /auth/login/fingerprint/email-verification
    Backend->>Backend: Validate code & trust device
    Backend-->>VerifyAPI: 200 OK (Login successful)
    VerifyAPI->>VerifyAPI: Set auth cookies
    VerifyAPI-->>VerifyUI: Success response
    VerifyUI->>Dashboard: Redirect to /dashboard
```

## 4. Login Flow (2FA Enabled - OTP Verification)

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant API as /api/auth/login
    participant Backend as Backend API
    participant OTP as OTP Service
    participant VerifyUI as Verify OTP Page
    participant VerifyAPI as /api/auth/verify-otp
    participant Dashboard as Dashboard

    User->>UI: Enter credentials
    UI->>API: POST /api/auth/login
    API->>Backend: POST /auth/login
    Backend->>Backend: Validate credentials
    Backend->>Backend: Detect 2FA enabled
    Backend->>OTP: Generate OTP
    Backend-->>API: 200 (Please verify OTP to login)
    API->>API: Set login_session_token cookie
    API->>API: Set gate-key-for-verify-otp cookie
    API-->>UI: OTP verification required
    UI->>VerifyUI: Redirect to /verify-otp

    User->>VerifyUI: Enter 6-digit OTP
    VerifyUI->>VerifyAPI: POST /api/auth/verify-otp
    VerifyAPI->>VerifyAPI: Get login_session_token from cookie
    VerifyAPI->>Backend: POST /auth/2fa/login (session_token + OTP)
    Backend->>Backend: Validate OTP
    Backend-->>VerifyAPI: 200 OK (Login successful)
    VerifyAPI->>VerifyAPI: Set auth cookies
    VerifyAPI-->>VerifyUI: Success response
    VerifyUI->>Dashboard: Redirect to /dashboard
```

## 5. Login Flow (2FA + Untrusted Device - Fingerprint Verification)

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant API as /api/auth/login
    participant Backend as Backend API
    participant VerifyUI as Verify Fingerprint Page
    participant Dashboard as Dashboard

    User->>UI: Enter credentials
    UI->>API: POST /api/auth/login (with fingerprint)
    API->>Backend: POST /auth/login
    Backend->>Backend: Validate credentials
    Backend->>Backend: Detect 2FA + untrusted device
    Backend-->>API: 200 (Verify OTP to verify device fingerprint)
    API->>API: Set verify_device_fingerprint_session_token
    API->>API: Set gate-key-for-verify-fingerprint
    API-->>UI: Fingerprint verification required
    UI->>VerifyUI: Redirect to /verify-fingerprint

    Note over User,Dashboard: User completes fingerprint verification
    VerifyUI->>Dashboard: Redirect to /dashboard
```

## 6. Forgot Password Flow

```mermaid
sequenceDiagram
    actor User
    participant UI as Forgot Password Page
    participant API as /api/auth/forgot-password
    participant Backend as Backend API
    participant Email as Email Service
    participant VerifyUI as Verify Forgot Page
    participant VerifyAPI as /api/auth/verify-forgot
    participant ChangeUI as Change Password Page
    participant ChangeAPI as /api/auth/change-password
    participant LoginUI as Login Page

    User->>UI: Enter email/username
    UI->>API: POST /api/auth/forgot-password
    API->>Backend: POST /auth/forgot-password
    Backend->>Email: Send reset code
    Backend-->>API: 200 OK (Reset link sent)
    API-->>UI: Success response
    UI->>VerifyUI: Redirect to /verify-forgot

    User->>VerifyUI: Enter 6-digit code
    VerifyUI->>VerifyAPI: POST /api/auth/verify-forgot
    VerifyAPI->>Backend: POST /auth/verify-forgot
    Backend->>Backend: Validate reset code
    Backend-->>VerifyAPI: 200 OK (Code verified)
    VerifyAPI-->>VerifyUI: Success response
    VerifyUI->>ChangeUI: Redirect to /change-password

    User->>ChangeUI: Enter new password
    ChangeUI->>ChangeUI: Validate password strength
    User->>ChangeUI: Submit new password
    ChangeUI->>ChangeAPI: POST /api/auth/change-password
    ChangeAPI->>Backend: POST /auth/change-password
    Backend->>Backend: Update password
    Backend-->>ChangeAPI: 200 OK (Password changed)
    ChangeAPI-->>ChangeUI: Success response
    ChangeUI->>LoginUI: Redirect to /login
    ChangeUI->>User: Show success toast
```

## 7. Authentication State Management

```mermaid
sequenceDiagram
    participant Client as Client Browser
    participant Cookies as HTTP Cookies
    participant API as API Routes
    participant Backend as Backend API

    Note over Client,Backend: Successful Authentication Sets:

    API->>Cookies: sessionId (httpOnly: false, 30 days)
    API->>Cookies: accessToken (httpOnly: true, 15 min)
    API->>Cookies: accessExp (httpOnly: true, 15 min)
    API->>Cookies: refreshToken (httpOnly: true, 30 days)

    Note over Client,Backend: Token Refresh Flow:

    Client->>API: Request with expired accessToken
    API->>API: Check accessExp
    API->>Backend: POST /auth/refresh (with refreshToken)
    Backend->>Backend: Validate refreshToken
    Backend-->>API: New accessToken
    API->>Cookies: Update accessToken & accessExp
    API-->>Client: Continue with request
```

## Cookie Summary

### Authentication Cookies (After Successful Login)
- **sessionId**: Session identifier (30 days, not httpOnly)
- **accessToken**: Short-lived access token (15 minutes, httpOnly)
- **accessExp**: Access token expiration timestamp (15 minutes, httpOnly)
- **refreshToken**: Long-lived refresh token (30 days, httpOnly)

### Gate Cookies (Temporary Navigation Guards)
- **gate-key-for-register**: Allows access to register page (60s)
- **gate-key-for-login**: Allows access to login page (60s)
- **gate-key-for-forgot-password**: Allows access to forgot password page (60s)
- **gate-key-for-verify-otp**: Allows access to OTP verification page (5 min)
- **gate-key-for-verify-login**: Allows access to login verification page (5 min)
- **gate-key-for-verify-register**: Allows access to register verification page (60s)
- **gate-key-for-verify-fingerprint**: Allows access to fingerprint verification page (5 min)

### Session Cookies (Temporary Authentication State)
- **login_session_token**: Temporary token for 2FA login flow (5 min)
- **verify_device_fingerprint_session_token**: Temporary token for device verification (5 min)
- **registration_data**: Stores email/username during registration (10 min)
- **verification_required**: Flag indicating verification is needed (10 min)

## Security Features

1. **Device Fingerprinting**: Tracks trusted devices using browser fingerprints
2. **Two-Factor Authentication (2FA)**: Optional OTP verification for enhanced security
3. **Email Verification**: Required for new registrations and untrusted devices
4. **HttpOnly Cookies**: Sensitive tokens stored in httpOnly cookies to prevent XSS
5. **Token Expiration**: Short-lived access tokens with refresh token rotation
6. **Request Timeouts**: All API calls have 10-20 second timeouts
7. **Password Strength Validation**: Enforces strong password requirements
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character
