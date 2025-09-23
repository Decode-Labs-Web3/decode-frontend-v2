# **User Flow Documentation - Decode Protocol Web3 Authentication System**

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

## **Project Overview**

This document describes the complete user authentication and identity management flow implemented in the Decode Protocol frontend application. The system integrates traditional authentication methods with modern Web3 wallet technology, providing users with multiple secure authentication options while maintaining a seamless user experience.

---

## **1. Landing Page & Authentication Options**

### **Main Landing Page (`/`)**

- **Dual Authentication Options**:
  - **Web3 Wallet Connection** - Primary option for crypto-native users
  - **Traditional Authentication** - Email/username-based login for all users
- **Features**:
  - Real-time wallet connection status display
  - Balance and network information for connected wallets
  - Smart form that detects existing users vs new users
  - Responsive design with modern UI components

### **Authentication Decision Flow**

```
User visits landing page
├── Connect Web3 Wallet → Wallet Authentication Flow
└── Enter Email/Username → Traditional Authentication Flow
```

---

## **2. Web3 Wallet Authentication Flow**

### **Wallet Connection Process**

1. **User clicks "Connect Wallet"** → AppKit modal opens
2. **User selects wallet** → MetaMask, WalletConnect, or other supported wallets
3. **Wallet connection established** → Address and network information displayed
4. **Balance fetched** → Real-time ETH balance displayed

### **Wallet Authentication Process**

1. **Challenge Generation** → Backend creates unique signing challenge
2. **Message Signing** → User signs challenge with wallet
3. **Signature Verification** → Backend validates signature and wallet ownership
4. **Session Creation** → JWT tokens created and stored securely
5. **Dashboard Access** → User redirected to main dashboard

### **Supported Wallets**

- MetaMask
- WalletConnect
- Coinbase Wallet
- Trust Wallet
- And other EIP-1193 compatible wallets

---

## **3. Traditional Authentication Flow**

### **Smart Login/Register Detection (`/`)**

- **Input Field**: Single field for email or username
- **Smart Detection**: System determines if user exists
- **Two Possible Outcomes**:
  - **Existing User** → Redirect to `/login`
  - **New User** → Redirect to `/register`

### **Login Page (`/login`)**

- **Input Fields**: Username/Email and Password
- **Features**:
  - Auto-fills email/username from cookies if available
  - Real-time error clearing when user types
  - "Forgot password?" link
  - Link to registration page
  - Device fingerprint verification

### **Login Process**

1. **User submits credentials** → API call to `/api/auth/login`
2. **Backend validates credentials and device fingerprint**
3. **Three possible outcomes**:

#### **A. Direct Login Success**

- Backend returns access tokens
- Frontend sets authentication cookies
- **Redirect**: `/dashboard`

#### **B. Device Fingerprint Verification Required**

- Backend returns `requiresVerification: true`
- Frontend stores email in sessionStorage
- **Redirect**: `/verify/login`

#### **C. Login Failed**

- Error message displayed
- User can retry or reset password

---

## **4. Device Fingerprint Verification Flow**

### **Verify Login Page (`/verify/login`)**

- **Purpose**: Verify device fingerprint for untrusted devices
- **Access Control**: Middleware protects route - requires verification context
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Auto-focus between input fields
  - Back to Login button
  - Resend functionality

### **Verification Process**

1. **User enters 6-digit code** → API call to `/api/auth/verify`
2. **Backend validates code and device fingerprint**
3. **Two possible outcomes**:

#### **A. Device Verified - Re-login Required**

- Backend returns `requiresRelogin: true`
- **Redirect**: `/login` (user must login again)

#### **B. Device Verified - Direct Access**

- Backend returns access tokens
- Frontend sets authentication cookies
- **Redirect**: `/dashboard`

---

## **5. Registration Flow**

### **Register Page (`/register`)**

- **Input Fields**: Username, Email, Password, Confirm Password
- **Features**:
  - Real-time password validation with visual feedback
  - Auto-fills email/username from cookies if available
  - Link to login page
  - Comprehensive form validation

### **Registration Process**

1. **User submits registration data** → API call to `/api/auth/register`
2. **Backend validates data and sends email verification**
3. **Frontend stores registration data in sessionStorage**
4. **Redirect**: `/verify/register`

### **Verify Register Page (`/verify/register`)**

- **Purpose**: Verify email address for new account
- **Access Control**: Middleware protects route - requires verification context
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Resend verification code functionality

### **Email Verification Process**

1. **User enters 6-digit code** → API call to `/api/auth/verify`
2. **Backend validates code and creates account**
3. **Success**: Account created successfully
4. **Redirect**: `/login`

---

## **6. Password Reset Flow**

### **Forgot Password Page (`/forgot-password`)**

- **Input Field**: Username or Email
- **Features**:
  - Clean, modern design
  - Back to Login button
  - Simple description: "Enter your email to receive a reset link"

### **Password Reset Process**

1. **User submits email/username** → API call to `/api/auth/forgot-password`
2. **Backend sends reset code to email**
3. **Redirect**: `/verify/forgot`

### **Verify Forgot Page (`/verify/forgot`)**

- **Purpose**: Verify reset code before allowing password change
- **Features**:
  - 6-digit code input with smart paste support
  - Supports format: `fingerprint-email-verification:XXXXXX`
  - Resend functionality

### **Code Verification Process**

1. **User enters 6-digit code** → API call to `/api/auth/verify`
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

## **7. Dashboard Experience**

### **Dashboard Overview (`/dashboard/overview`)**

- **Access Control**: Middleware protects route - requires valid authentication tokens
- **Features**:
  - User profile information display
  - Avatar management with IPFS storage
  - Account statistics and security status
  - Quick access to all dashboard sections

### **Personal Information Management (`/dashboard/personal`)**

- **Profile Management**:
  - Display name and bio editing
  - Avatar upload with IPFS integration
  - Username and email management
- **Features**:
  - Real-time form validation
  - Image upload with preview
  - Change tracking and undo functionality

### **Web3 Wallet Management (`/dashboard/wallets`)**

- **Wallet Integration**:
  - Connected wallet display
  - Balance and network information
  - Wallet reordering functionality
- **Features**:
  - Drag-and-drop wallet ordering
  - Primary wallet designation
  - Wallet removal and management

### **Security Center (`/dashboard/security`)**

- **Security Features**:
  - Two-factor authentication status
  - Password management
  - Device trust management
- **Features**:
  - Security status overview
  - Quick security actions
  - Trusted device management

### **Additional Dashboard Sections**

- **Devices** - Manage trusted devices
- **Connections** - Third-party integrations
- **Notifications** - System notifications
- **News** - Updates and announcements

---

## **8. Middleware Protection System**

### **Protected Routes**

- `/dashboard/*` - Requires valid authentication tokens
- `/verify/*` - Requires verification context
- `/change-password` - Requires forgot password context

### **Middleware Logic**

1. **Dashboard Protection**: Checks for valid JWT tokens
2. **Verification Route Protection**: Checks for appropriate context
3. **Token Refresh**: Automatic token refresh when needed
4. **Cookie Management**: Secure cookie handling and cleanup

### **Security Features**

- **HttpOnly Cookies**: Secure token storage
- **Automatic Refresh**: Seamless token renewal
- **CSRF Protection**: Request validation
- **Route Validation**: Context-aware access control

---

## **9. Smart Code Input System**

### **Enhanced User Experience**

- **Smart Paste**: Automatically extracts 6-character codes from `fingerprint-email-verification:XXXXXX` format
- **Auto-focus**: Automatically moves to next input field
- **Keyboard Navigation**: Arrow keys and backspace support
- **Input Validation**: Only allows alphanumeric characters (a-f, 0-9)
- **Visual Feedback**: Clear indication of input status

### **Supported Formats**

- `fingerprint-email-verification:123456`
- `123456` (direct code input)
- Paste from email clients
- Manual typing with auto-advance

---

## **10. Component Architecture**

### **Authentication Components**

- **`AuthCard`**: Consistent card layout for all auth pages
- **`BackButton`**: Reusable back navigation
- **`TextField`**: Standardized text input with validation
- **`PasswordField`**: Password input with toggle visibility
- **`SubmitButton`**: Loading states and disabled states
- **`BackgroundAccents`**: Animated background elements
- **`BrandLogos`**: Brand logo display

### **Application Components**

- **`Navbar`**: Main navigation bar
- **`Sidebar`**: Dashboard sidebar navigation
- **`PageHeader`**: Consistent page headers
- **`ToastProvider`**: Notification system

### **Component Organization**

- **`/components/(auth)/`**: Authentication-specific components
- **`/components/(app)/`**: Application-specific components
- **Index exports**: Clean import structure
- **TypeScript interfaces**: Full type safety

---

## **11. Security Implementation**

### **Multi-Layer Security**

- **Device Fingerprinting**: Unique device identification
- **Email Verification**: Multi-factor authentication
- **JWT Token Management**: Secure session handling
- **Route Protection**: Middleware-based access control
- **CSRF Protection**: Request validation and cookie security

### **Web3 Security**

- **Message Signing**: Cryptographic authentication
- **Wallet Verification**: Address-based identity verification
- **Network Validation**: Supported network checks
- **Signature Validation**: Backend verification of wallet signatures

### **Cookie Security**

- **HttpOnly Tokens**: Secure server-side token storage
- **Secure Cookies**: Production environment security
- **SameSite Protection**: CSRF protection
- **Automatic Expiration**: Based on backend response

---

## **12. Error Handling & User Experience**

### **User-Friendly Error Messages**

- **Real-time Clearing**: Errors clear when user starts typing
- **Specific Messages**: Backend error messages displayed to user
- **Fallback Messages**: Generic messages for unknown errors
- **Visual Feedback**: Clear error indication with proper styling

### **Loading States**

- **Button Loading**: Visual feedback during API calls
- **Form Validation**: Real-time input validation
- **Progress Indication**: Clear indication of processing status

### **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Desktop Enhancement**: Enhanced features for larger screens
- **Touch Support**: Full touch interaction support

---

## **13. State Management**

### **Client-Side Storage**

- **SessionStorage**: Temporary data (email, registration data)
- **LocalStorage**: Backup storage for email
- **Cookies**: Authentication tokens and verification context
- **React Context**: Global application state

### **Form State Management**

- **Real-time Validation**: Immediate feedback on input
- **Loading States**: Visual feedback during API calls
- **Error States**: Clear error display and recovery
- **Change Tracking**: Form modification detection

---

## **14. Web3 Integration Details**

### **AppKit Configuration**

- **Supported Networks**: Ethereum Mainnet, Arbitrum
- **Wallet Providers**: MetaMask, WalletConnect, Coinbase Wallet
- **Project ID**: Reown AppKit project configuration
- **Theme Customization**: Consistent UI with application design

### **Ethers.js Integration**

- **Provider Management**: Browser provider for wallet interaction
- **Balance Fetching**: Real-time cryptocurrency balance
- **Message Signing**: Cryptographic signature generation
- **Network Detection**: Automatic network identification

### **IPFS Integration**

- **Pinata Service**: Decentralized file storage
- **Avatar Upload**: Profile image storage
- **Content Addressing**: Immutable file references
- **Gateway Access**: Public file access through IPFS gateways

---

## **15. Academic Project Context**

### **Learning Objectives Demonstrated**

- **Full-Stack Development**: Complete web application development
- **Web3 Integration**: Modern blockchain technology implementation
- **Security Best Practices**: Comprehensive security implementation
- **User Experience Design**: Modern, responsive interface design
- **TypeScript Proficiency**: Advanced type safety and development practices

### **Technical Skills Showcased**

- **React/Next.js**: Modern frontend development
- **TypeScript**: Advanced type safety
- **Web3 Development**: Blockchain integration
- **Security Implementation**: Authentication and authorization
- **UI/UX Design**: Modern, responsive design

---

## **Summary**

The Decode Protocol authentication system provides a comprehensive, secure, and user-friendly authentication experience that bridges traditional authentication methods with modern Web3 technology. The system offers:

- **Dual Authentication Options**: Traditional credentials and Web3 wallet integration
- **Advanced Security**: Device fingerprinting, email verification, and multi-factor authentication
- **Modern User Experience**: Smart code input, real-time validation, and responsive design
- **Web3 Integration**: Seamless wallet connection and blockchain interaction
- **Academic Excellence**: Demonstrates advanced full-stack development skills

The system ensures security while maintaining usability through features like smart paste, auto-focus, real-time validation, and comprehensive error handling, providing users with multiple secure authentication options while maintaining a seamless experience across all devices and platforms.

---

**Developed by Vũ Trần Quang Minh for University of Greenwich Final Project**
> _Integrating traditional authentication with Web3 technology for a secure, modern user experience._

---
