# **User Flow Documentation - Decode Protocol Authentication System**

## **Overview**
This document describes the complete user authentication flow implemented in the Decode Protocol frontend application. The system includes device fingerprint verification, email verification, password reset functionality, and middleware-based route protection.

---

## **1. Login Flow**

### **Login Page (`/login`)**
- **Input Fields**: Username/Email and Password
- **Features**: 
  - Auto-fills email/username from cookies if available
  - Real-time error clearing when user types
  - "Forgot password?" link
  - Link to registration page

### **Login Process**
1. **User submits credentials** → API call to `/api/auth/login`
2. **Backend validates credentials and device fingerprint**
3. **Two possible outcomes**:

#### **A. Direct Login Success**
- Backend returns access tokens
- Frontend sets authentication cookies (`token`, `refreshToken`, `from_success`)
- **Redirect**: `/dashboard`

#### **B. Device Fingerprint Verification Required**
- Backend returns `requiresVerification: true`
- Frontend stores email in sessionStorage/localStorage
- **Redirect**: `/verify-login`

---

## **2. Device Fingerprint Verification Flow**

### **Verify Login Page (`/verify-login`)**
- **Purpose**: Verify device fingerprint for trusted devices
- **Access Control**: Middleware protects route - requires verification context
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Auto-focus between input fields
  - Back to Login button
  - Resend functionality (not yet implemented)

### **Verification Process**
1. **User enters 6-digit code** → API call to `/api/auth/verify-login`
2. **Backend validates code and device fingerprint**
3. **Two possible outcomes**:

#### **A. Device Verified - Re-login Required**
- Backend returns `requiresRelogin: true`
- **Redirect**: `/login` (user must login again)

#### **B. Device Verified - Direct Access**
- Backend returns access tokens
- Frontend sets authentication cookies
- **Redirect**: `/login` (then to dashboard)

---

## **3. Registration Flow**

### **Register Page (`/register`)**
- **Input Fields**: Username, Email, Password, Confirm Password
- **Features**:
  - Real-time password validation with visual feedback
  - Auto-fills email/username from cookies if available
  - Link to login page

### **Registration Process**
1. **User submits registration data** → API call to `/api/auth/register`
2. **Backend validates data and sends email verification**
3. **Frontend stores registration data in sessionStorage**
4. **Redirect**: `/verify-register`

### **Verify Register Page (`/verify-register`)**
- **Purpose**: Verify email address for new account
- **Access Control**: Middleware protects route - requires verification context
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Resend verification code functionality

### **Email Verification Process**
1. **User enters 6-digit code** → API call to `/api/auth/verify-register`
2. **Backend validates code and creates account**
3. **Success**: Account created successfully
4. **Redirect**: `/login`

---

## **4. Password Reset Flow**

### **Forgot Password Page (`/forgot-password`)**
- **Input Field**: Username or Email
- **Features**:
  - Clean, modern design with minimal information
  - Back to Login button (left-aligned)
  - Simple description: "Enter your email to receive a reset link"

### **Password Reset Process**
1. **User submits email/username** → API call to `/api/auth/forgot-password`
2. **Backend sends reset code to email**
3. **Redirect**: `/verify-forgot`

### **Verify Forgot Page (`/verify-forgot`)**
- **Purpose**: Verify reset code before allowing password change
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Resend functionality

### **Code Verification Process**
1. **User enters 6-digit code** → API call to `/api/auth/verify-forgot`
2. **Backend validates reset code**
3. **Success**: Code verified, `forgot_code` cookie set
4. **Redirect**: `/change-password`

### **Change Password Page (`/change-password`)**
- **Input Fields**: New Password, Confirm New Password
- **Features**:
  - Real-time password validation
  - Visual feedback for password requirements

### **Password Change Process**
1. **User submits new password** → API call to `/api/auth/change-password`
2. **Backend validates code from cookie and updates password**
3. **Success**: Password changed, `forgot_code` cookie cleared
4. **Redirect**: `/login`

---

## **5. Dashboard Access**

### **Dashboard Page (`/dashboard`)**
- **Access Control**: Middleware protects route - requires valid authentication tokens
- **Features**:
  - Displays authentication status
  - Session information
  - Security status
  - Logout functionality

### **Authentication Check**
- **Middleware validates**: `token` and `refreshToken` cookies
- **Missing tokens**: Redirect to `/login`
- **Valid tokens**: Allow access to dashboard

---

## **6. Middleware Protection**

### **Protected Routes**
- `/dashboard/*` - Requires valid authentication tokens
- `/verify-login` - Requires verification context (email in storage or referer)
- `/verify-register` - Requires verification context (registration data or referer)

### **Middleware Logic**
1. **Dashboard Protection**: Checks for `token` and `refreshToken` cookies
2. **Verification Route Protection**: Checks for appropriate context cookies/storage
3. **Cookie Cleanup**: Clears `from_success` cookie after dashboard access

---

## **7. Smart Code Input Features**

### **Enhanced User Experience**
- **Smart Paste**: Automatically extracts 6-character codes from `fingerprint-email-verification:XXXXXX` format
- **Auto-focus**: Automatically moves to next input field
- **Keyboard Navigation**: Arrow keys and backspace support
- **Input Validation**: Only allows alphanumeric characters (a-f, 0-9)

---

## **8. Component Architecture**

### **Reusable Components**
- **`AuthCard`**: Consistent card layout for all auth pages
- **`BackButton`**: Reusable back navigation with customizable text
- **`TextField`**: Standardized text input with validation
- **`PasswordField`**: Password input with toggle visibility
- **`PasswordValidation`**: Real-time password strength feedback
- **`SubmitButton`**: Loading states and disabled states
- **`BackgroundAccents`**: Animated background elements
- **`BrandLogos`**: Brand logo display

### **Component Organization**
- **`/components/(auth)/`**: Authentication-specific components
- **`/components/(app)/`**: Application-specific components
- **Index exports**: Clean import structure

---

## **9. Security Features**

### **Cookie Management**
- **HttpOnly cookies**: For sensitive tokens
- **Secure cookies**: In production environment
- **SameSite protection**: Lax policy for CSRF protection
- **Automatic expiration**: Based on backend response

### **Device Fingerprinting**
- **Automatic generation**: On login attempts
- **Backend validation**: Server-side fingerprint verification
- **Email verification**: For untrusted devices

### **Route Protection**
- **Middleware-based**: Server-side route protection
- **Context validation**: Ensures proper flow progression
- **Token validation**: Real-time authentication checks

---

## **10. Error Handling**

### **User-Friendly Messages**
- **Real-time clearing**: Errors clear when user starts typing
- **Specific error messages**: Backend error messages displayed to user
- **Fallback messages**: Generic messages for unknown errors
- **Visual feedback**: Red error boxes with proper styling

### **API Error Handling**
- **Consistent response format**: `{ success, statusCode, message }`
- **Proper HTTP status codes**: Matching backend responses
- **Graceful degradation**: Fallback responses for network issues

---

## **11. State Management**

### **Client-Side Storage**
- **SessionStorage**: Temporary data (email, registration data)
- **LocalStorage**: Backup storage for email
- **Cookies**: Authentication tokens and verification context

### **Form State**
- **Real-time validation**: Immediate feedback on input
- **Loading states**: Visual feedback during API calls
- **Error states**: Clear error display and recovery

---

## **Summary**

The Decode Protocol authentication system provides a comprehensive, secure, and user-friendly authentication experience with:

- **Multi-factor authentication** through device fingerprinting
- **Email verification** for both registration and password reset
- **Smart code input** with enhanced UX features
- **Middleware-based security** for route protection
- **Reusable component architecture** for maintainability
- **Comprehensive error handling** for better user experience

The system ensures security while maintaining usability through features like smart paste, auto-focus, and real-time validation feedback.

---