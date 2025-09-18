# Decode Protocol - Web3 Authentication & Identity Management System

**Final Project - University of Greenwich**
**Student:** Vũ Trần Quang Minh
**Email:** minhvtqgcs220006@fpt.edu.vn
**Academic Year:** 2024-2025

---

## 🎯 Project Overview

Decode Protocol is a comprehensive Web3 authentication and identity management system that bridges traditional authentication methods with modern blockchain technology. Built as a final project for the University of Greenwich, this system provides secure, user-friendly authentication through both traditional credentials and Web3 wallet integration.

## 🚀 Key Features

### 🔐 **Dual Authentication System**

- **Traditional Authentication** - Email/username and password-based login
- **Web3 Wallet Integration** - Connect and authenticate using MetaMask and other Web3 wallets
- **Device Fingerprint Verification** - Advanced security through device trust management
- **Email Verification** - Secure account creation and password reset flows

### 🛡️ **Advanced Security Features**

- **Middleware-based Route Protection** - Server-side authentication checks
- **HttpOnly Cookies** - Secure token storage with automatic refresh
- **CSRF Protection** - SameSite cookie policies and request validation
- **Real-time Validation** - Immediate feedback and error handling
- **Device Trust Management** - Email verification for new devices

### 🎨 **Modern User Experience**

- **Responsive Design** - Works seamlessly on all device sizes
- **Real-time Feedback** - Live validation and error clearing
- **Smart Code Input** - Enhanced UX with auto-focus and smart paste
- **Loading States** - Visual feedback during API calls
- **Modern UI Components** - Clean, professional interface design

### 🌐 **Web3 Integration**

- **AppKit Integration** - Seamless wallet connection experience
- **Multi-chain Support** - Ethereum and Arbitrum network support
- **Wallet Authentication** - Sign messages to authenticate with Web3 wallets
- **Balance Display** - Real-time wallet balance and connection status

## 🏗️ Technical Architecture

### **Frontend Stack**

- **Next.js 15.5.3** - React framework with App Router
- **TypeScript 5** - Full type safety and development experience
- **Tailwind CSS 4** - Utility-first styling framework
- **Ethers.js 6.15.0** - Ethereum library for Web3 interactions
- **AppKit 1.8.6** - Wallet connection and management

### **Security Implementation**

- **JWT Token Management** - Secure authentication with automatic refresh
- **Device Fingerprinting** - Browser and device-specific identification
- **Route Middleware** - Server-side protection for sensitive routes
- **Cookie Security** - HttpOnly, Secure, and SameSite policies

## 📋 Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Backend API endpoint (configured via environment variables)
- Web3 wallet (MetaMask, WalletConnect, etc.)

## 🛠️ Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd decode-frontend-v2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   BACKEND_URL=http://localhost:4000
   NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id
   PINATA_API_Ke=your_pinata_api_key
   PINATA_API_Secret=your_pinata_secret
   PINATA_JWT=your_pinata_jwt_token
   NODE_ENV=development
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/             # Traditional login
│   │   ├── register/          # User registration
│   │   ├── verify/            # Email verification pages
│   │   ├── forgot-password/   # Password reset request
│   │   └── change-password/   # New password setup
│   ├── (app)/                 # Protected application pages
│   │   └── dashboard/         # Main dashboard with multiple sections
│   │       ├── overview/      # User profile overview
│   │       ├── personal/      # Personal information management
│   │       ├── wallets/       # Web3 wallet management
│   │       ├── security/      # Security settings
│   │       ├── devices/       # Device management
│   │       ├── connections/   # Third-party connections
│   │       ├── notifications/ # Notification center
│   │       └── news/          # News and updates
│   ├── api/                   # API routes
│   │   ├── auth/              # Authentication endpoints
│   │   ├── users/             # User management endpoints
│   │   └── wallet/            # Web3 wallet endpoints
│   ├── providers/             # React context providers
│   └── middleware.ts          # Route protection middleware
├── components/
│   ├── (auth)/                # Authentication components
│   │   ├── AuthCard.tsx       # Main auth card layout
│   │   ├── TextField.tsx      # Standardized text input
│   │   ├── PasswordField.tsx  # Password input with toggle
│   │   ├── SubmitButton.tsx   # Loading states button
│   │   ├── BackgroundAccents.tsx # Animated backgrounds
│   │   └── BrandLogos.tsx     # Brand logo display
│   └── (app)/                 # Application components
│       ├── Navbar.tsx         # Navigation bar
│       ├── Sidebar.tsx        # Dashboard sidebar
│       └── PageHeader.tsx     # Page header component
├── contexts/                  # React contexts
├── hooks/                     # Custom React hooks
├── services/                  # Business logic services
├── utils/                     # Utility functions
└── interfaces/                # TypeScript type definitions
```

## 🔄 Authentication Flows

### 1. **Traditional Authentication Flow**

```
Landing Page → Email/Username Input → Login/Register → Dashboard
```

### 2. **Web3 Wallet Authentication Flow**

```
Landing Page → Connect Wallet → Sign Message → Dashboard
```

### 3. **Device Verification Flow**

```
Login Attempt → Device Check → Email Verification → Dashboard
```

### 4. **Password Reset Flow**

```
Forgot Password → Email Code → Verify Code → Change Password → Login
```

## 🛡️ Security Features

### **Multi-Layer Security**

- **Device Fingerprinting** - Unique device identification
- **Email Verification** - Multi-factor authentication
- **JWT Token Management** - Secure session handling
- **Route Protection** - Middleware-based access control
- **CSRF Protection** - Request validation and cookie security

### **Web3 Security**

- **Message Signing** - Cryptographic authentication
- **Wallet Verification** - Address-based identity verification
- **Network Validation** - Supported network checks

## 🎯 Dashboard Features

### **User Management**

- **Profile Overview** - Personal information display
- **Avatar Management** - IPFS-based image storage
- **Account Settings** - Username and email management

### **Web3 Integration**

- **Wallet Management** - Connect and manage multiple wallets
- **Balance Display** - Real-time cryptocurrency balances
- **Transaction History** - Wallet activity tracking

### **Security Center**

- **Device Management** - Trusted device management
- **Security Settings** - Password and verification settings
- **Activity Monitoring** - Login and security event tracking

## 🔧 API Endpoints

### **Authentication Routes**

- `POST /api/auth/login` - Traditional user login
- `POST /api/auth/register` - User registration
- `POST /api/auth/login-or-register` - Smart login/register detection
- `POST /api/auth/verify` - Email verification
- `POST /api/auth/forgot-password` - Password reset initiation
- `POST /api/auth/change-password` - Password update

### **Web3 Wallet Routes**

- `POST /api/wallet/auth-challenge` - Generate signing challenge
- `POST /api/wallet/auth-validation` - Validate wallet signature

### **User Management Routes**

- `GET /api/users/overview` - User profile data
- `PUT /api/users/profile-change` - Update user profile
- `POST /api/users/avatar` - Upload avatar image

## 🚀 Deployment

### **Environment Variables**

```env
# Backend Configuration
BACKEND_URL=https://your-backend-api.com

# Web3 Configuration
NEXT_PUBLIC_REOWN_PROJECT_ID=your_reown_project_id

# IPFS Configuration (Pinata)
PINATA_API_Ke=your_pinata_api_key
PINATA_API_Secret=your_pinata_secret
PINATA_JWT=your_pinata_jwt_token

# Environment
NODE_ENV=production
```

### **Build Commands**

```bash
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🧪 Development

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### **Code Quality**

- **TypeScript** - Full type safety throughout the application
- **ESLint** - Code quality and consistency enforcement
- **Tailwind CSS** - Utility-first styling approach
- **Component Architecture** - Modular, reusable components

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers with Web3 wallet support

## 🎓 Academic Context

This project was developed as a final project for the University of Greenwich, demonstrating:

- **Full-Stack Development** - Complete web application development
- **Web3 Integration** - Modern blockchain technology implementation
- **Security Best Practices** - Comprehensive security implementation
- **User Experience Design** - Modern, responsive interface design
- **TypeScript Proficiency** - Advanced type safety and development practices

## 🔮 Future Enhancements

- [ ] Multi-wallet support expansion
- [ ] Social login integration
- [ ] Advanced security analytics
- [ ] Mobile app development
- [ ] Cross-chain compatibility
- [ ] NFT integration
- [ ] DeFi protocol integration

## 📄 License

This project is developed as part of academic coursework at the University of Greenwich.

## 🆘 Support

For questions or support regarding this project:

- **Student Email:** minhvtqgcs220006@fpt.edu.vn
- **University:** University of Greenwich
- **Project Type:** Final Project - Web3 Authentication System

## 📚 Documentation

- [USERFLOW.md](USERFLOW.md) - Detailed user flow documentation
- [Component Documentation](src/components/) - In-code component documentation
- [API Documentation](src/app/api/) - API endpoint documentation

---

**Built with ❤️ by Vũ Trần Quang Minh for University of Greenwich Final Project**

_Integrating traditional authentication with Web3 technology for a secure, modern user experience._

---
