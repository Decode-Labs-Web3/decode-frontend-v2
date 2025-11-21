# Decode Protocol - Web3 Authentication & Identity Management System

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

## 🎯 Technical Overview

Decode Protocol is a comprehensive Web3 authentication and identity management system built with Next.js 15.5.3, TypeScript 5, and modern Web3 technologies. The system implements dual authentication mechanisms combining traditional email/password authentication with Web3 wallet integration through cryptographic message signing.

## 🚀 Core Technical Features

### 🔐 **Advanced Authentication Architecture**

- **Dual Authentication System**: Traditional credentials and Web3 wallet integration
- **Device Fingerprinting**: SHA-256 hashed device identification using browser, OS, timezone, language, and audio fingerprinting
- **JWT Token Management**: Secure session handling with automatic refresh and HttpOnly cookies
- **Middleware-based Route Protection**: Server-side authentication checks with token validation
- **Multi-factor Authentication**: Email verification and device trust management

### 🛡️ **Security Implementation**

- **Cryptographic Security**: Web3 message signing with ethers.js for wallet authentication
- **CSRF Protection**: SameSite cookie policies and request validation headers
- **Secure Cookie Management**: HttpOnly, Secure, and SameSite policies with automatic expiration
- **Content Security Policy**: Comprehensive CSP headers for XSS protection
- **Request Validation**: Internal request headers to prevent external API access

### 🌐 **Web3 Integration**

- **AppKit Integration**: WalletConnect v2 with multi-wallet support (MetaMask, Coinbase, Trust Wallet)
- **Ethers.js 6.15.0**: Ethereum library for Web3 interactions and message signing
- **Multi-chain Support**: Ethereum Mainnet and Arbitrum network compatibility
- **IPFS Integration**: Pinata service for decentralized avatar storage
- **Wallet Management**: Connect, link, and manage multiple Web3 wallets

## 🏗️ Technical Stack

### **Frontend Framework**

- **Next.js 15.5.3**: React framework with App Router and server-side rendering
- **TypeScript 5**: Full type safety with strict configuration
- **React 19.1.1**: Latest React with concurrent features
- **Tailwind CSS 4**: Utility-first styling with custom CSS variables

### **Web3 & Blockchain**

- **@reown/appkit 1.8.6**: Wallet connection and management
- **@reown/appkit-adapter-ethers 1.8.6**: Ethers.js integration
- **ethers 6.15.0**: Ethereum library for blockchain interactions
- **IPFS/Pinata**: Decentralized file storage for avatars

### **Authentication & Security**

- **JWT Token Management**: Access and refresh token rotation
- **Device Fingerprinting**: Browser-based device identification
- **Cookie Security**: HttpOnly, Secure, SameSite policies
- **Middleware Protection**: Route-level authentication guards

### **Development Tools**

- **ESLint 9**: Code quality and consistency
- **TypeScript Compiler**: Type checking and compilation
- **React Loading Skeleton**: Loading state components
- **React Toastify**: User notification system

## 📚 Detailed Technology Stack

### **Programming Languages**
- **TypeScript**: Primary language for type-safe development
- **JavaScript**: Used for configuration and utility scripts

### **Frameworks**
- **Next.js**: Full-stack React framework with App Router for routing and server-side rendering
- **React**: UI library for building interactive user interfaces
- **Radix UI**: Low-level UI primitives for accessible components (via shadcn/ui)

### **Libraries**
#### **Web3 & Blockchain Libraries**
- `@reown/appkit`: Wallet connection and management
- `@reown/appkit-adapter-ethers`: Ethers.js adapter for AppKit
- `ethers`: Ethereum library for blockchain interactions and cryptographic operations

#### **UI & Styling Libraries**
- `tailwindcss`: Utility-first CSS framework
- `class-variance-authority`: Class name utilities for component variants
- `clsx`: Conditional class name utility
- `tailwind-merge`: Tailwind class merging utility
- `@radix-ui/*`: Collection of accessible UI primitives (alert-dialog, avatar, checkbox, collapsible, dialog, dropdown-menu, hover-card, label, popover, progress, radio-group, scroll-area, select, separator, slot, switch, tabs, tooltip)
- `lucide-react`: Icon library
- `@fortawesome/fontawesome-svg-core`: FontAwesome icon core
- `@fortawesome/free-solid-svg-icons`: FontAwesome solid icons
- `@fortawesome/react-fontawesome`: React FontAwesome component

#### **State Management & Data Fetching**
- `@reduxjs/toolkit`: Redux toolkit for state management
- `react-redux`: React bindings for Redux
- `socket.io-client`: WebSocket client for real-time communication

#### **Form Handling & Validation**
- `react-hook-form`: Performant forms with easy validation
- `@hookform/resolvers`: Resolvers for react-hook-form
- `zod`: TypeScript-first schema validation

#### **Charts & Visualization**
- `recharts`: Composable charting library built on React components

#### **Utilities**
- `date-fns`: Modern JavaScript date utility library
- `cmdk`: Command palette component
- `react-qr-code`: QR code generation for React
- `react-toastify`: Toast notifications
- `mongodb`: MongoDB driver for database operations

### **Tools**
#### **Development Tools**
- **ESLint**: Linting tool for code quality
- **TypeScript Compiler (tsc)**: Type checking and compilation
- **Next.js CLI**: Development server and build tools

#### **Build Tools**
- **npm**: Package manager and script runner
- **Next.js Build System**: Optimized production builds

#### **Code Quality Tools**
- **ESLint Config Next**: ESLint configuration for Next.js
- **@typescript-eslint/eslint-plugin**: TypeScript ESLint rules
- **@typescript-eslint/parser**: TypeScript parser for ESLint

### **Data Storage and Management**
#### **Client-Side Storage**
- **Cookies**: Secure HTTP-only cookies for session management
- **LocalStorage**: Browser storage for theme preferences and user settings

#### **Server-Side Storage**
- **MongoDB**: NoSQL database for user data, authentication, and application state
- **IPFS (via Pinata)**: Decentralized storage for user avatars and media files

#### **Data Management**
- **JWT Tokens**: JSON Web Tokens for authentication and authorization
- **Device Fingerprinting**: SHA-256 hashed device identification for security
- **Session Management**: Secure session handling with automatic token refresh

### **User Interface Development**
#### **Design System**
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **shadcn/ui**: Component library built on Radix UI primitives
- **CSS Variables**: Custom properties for theme management

#### **Component Architecture**
- **Reusable Components**: Modular UI components for consistency
- **Accessible Design**: WCAG compliant components using Radix UI
- **Responsive Design**: Mobile-first approach with breakpoint utilities

#### **User Experience**
- **Loading States**: Skeleton components for better perceived performance
- **Toast Notifications**: User feedback system for actions and errors
- **Real-time Updates**: Server-sent events for live notifications
- **Form Validation**: Client-side validation with error messaging

#### **Theming**
- **Dark/Light Mode**: Theme switching with localStorage persistence
- **Custom Variables**: CSS custom properties for color schemes

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Backend API endpoint (configured via environment variables)
- Web3 wallet (MetaMask, WalletConnect, etc.)
- Reown Project ID for AppKit integration

## 🛠️ Installation & Setup

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd decode-frontend-v2
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file with required variables:

   ```env
   BACKEND_BASE_URL=http://localhost:4000
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   PINATA_API_KEY=your_pinata_api_key
   PINATA_API_SECRET=your_pinata_secret
   PINATA_JWT=your_pinata_jwt_token
   NODE_ENV=development
   ```

3. **Development Server**

   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm run start
   ```

## 🔄 Authentication Flows

### **Web3 Wallet Authentication**

1. **Wallet Connection**: AppKit modal opens for wallet selection
2. **Challenge Generation**: Backend creates unique signing challenge
3. **Message Signing**: User signs challenge with private key
4. **Signature Verification**: Backend validates signature and wallet ownership
5. **Session Creation**: JWT tokens created and stored securely

### **Traditional Authentication**

1. **Smart Detection**: System determines if user exists via email/username
2. **Device Fingerprinting**: SHA-256 hashed device identification
3. **Multi-factor Verification**: Email OTP for new devices
4. **Token Management**: Secure cookie-based session handling

### **Device Trust Management**

- **Fingerprint Generation**: Browser, OS, timezone, language, audio fingerprinting
- **Trust Verification**: Email verification for untrusted devices
- **Session Management**: Device-specific session tracking

## 🛡️ Security Features

### **Multi-Layer Security**

- **Device Fingerprinting**: Unique device identification using multiple browser APIs
- **Email Verification**: Multi-factor authentication for new devices
- **JWT Token Management**: Secure session handling with automatic refresh
- **Route Protection**: Middleware-based access control with token validation
- **CSRF Protection**: Request validation and secure cookie policies

### **Web3 Security**

- **Message Signing**: Cryptographic authentication using wallet private keys
- **Wallet Verification**: Address-based identity verification
- **Network Validation**: Supported network checks (Ethereum, Arbitrum)
- **Signature Validation**: Backend verification of wallet signatures

### **Cookie Security**

- **HttpOnly Tokens**: Secure server-side token storage
- **Secure Cookies**: Production environment security
- **SameSite Protection**: CSRF protection
- **Automatic Expiration**: Based on backend response timestamps

## 🎨 User Experience Features

### **Responsive Design**

- **Mobile-First**: Optimized for mobile devices
- **Desktop Enhancement**: Enhanced features for larger screens
- **Touch Support**: Full touch interaction support
- **Dark/Light Mode**: Theme switching with localStorage persistence

### **Real-time Features**

- **Server-Sent Events**: Real-time notifications via WebSocket
- **Live Updates**: Instant UI updates for user actions
- **Toast Notifications**: User-friendly success/error messages

## 🔧 API Integration

### **Authentication Endpoints**

- `POST /api/auth/login` - Traditional user login with device fingerprinting
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/login-or-register` - Smart login/register detection
- `POST /api/auth/verify-*` - Email verification for various flows
- `POST /api/auth/forgot-password` - Password reset initiation
- `POST /api/auth/change-password` - Password update

### **Web3 Wallet Endpoints**

- `POST /api/wallet/auth-challenge` - Generate signing challenge
- `POST /api/wallet/auth-validation` - Validate wallet signature
- `POST /api/wallet/link-challenge` - Generate wallet linking challenge
- `POST /api/wallet/link-validation` - Validate wallet linking signature
- `GET /api/wallet/all-wallet` - Fetch user's connected wallets

### **User Management Endpoints**

- `GET /api/users/overview` - User profile data
- `PUT /api/users/profile-change` - Update user profile
- `POST /api/users/avatar` - Upload avatar to IPFS
- `GET /api/users/notifications` - Fetch user notifications
- `GET /api/users/websocket` - Server-sent events for real-time updates

## 🚀 Deployment Configuration

### **Environment Variables**

```env
# Backend Configuration
BACKEND_BASE_URL=https://your-backend-api.com

# Web3 Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id

# IPFS Configuration (Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_secret
PINATA_JWT=your_pinata_jwt_token

# Environment
NODE_ENV=production
PUBLIC_FRONTEND_URL=https://decode.decodenetwork.app
```

### **Build Optimizations**

- **Memory-based Workers**: Optimized for memory-constrained environments
- **Code Splitting**: AppKit bundle separation for better performance
- **Console Removal**: Production console.log removal
- **Image Optimization**: Unoptimized images for IPFS compatibility

### **Security Headers**

- **Content Security Policy**: Comprehensive CSP for XSS protection
- **CORS Configuration**: Proper cross-origin resource sharing
- **Security Headers**: X-Frame-Options, X-Content-Type-Options, HSTS
- **Permissions Policy**: Camera, microphone, geolocation restrictions

## 🧪 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with Web3 wallet support

## 🎓 Academic Context

This project demonstrates advanced full-stack development skills including:

- **Modern React Development**: Next.js 15 with App Router and server components
- **TypeScript Proficiency**: Advanced type safety and development practices
- **Web3 Integration**: Blockchain technology implementation with ethers.js
- **Security Implementation**: Comprehensive authentication and authorization
- **User Experience Design**: Modern, responsive interface with accessibility

## 🔮 Technical Enhancements

- **Multi-wallet Support**: Expanded wallet provider integration
- **Social Login**: OAuth integration with major providers
- **Advanced Analytics**: Security event tracking and monitoring
- **Mobile App**: React Native implementation
- **Cross-chain Compatibility**: Additional blockchain network support
- **NFT Integration**: Non-fungible token management
- **DeFi Protocol Integration**: Decentralized finance features

## 📄 License

This project is developed as part of academic coursework at the University of Greenwich.

## 🆘 Support

For technical questions or support:

- **Student Email:** minhvtqgcs220006@fpt.edu.vn
- **University:** University of Greenwich
- **Project Type:** Final Project - Web3 Authentication System

---

**Built with ❤️ by Vũ Trần Quang Minh for University of Greenwich Final Project**

_Integrating traditional authentication with Web3 technology for a secure, modern user experience._

---
