# Decode Protocol - Frontend Authentication System

A modern, secure authentication system built with Next.js 14, featuring device fingerprint verification, email verification, and comprehensive security measures.

## 🚀 Features

### 🔐 **Advanced Authentication**
- **Device Fingerprint Verification** - Automatic device trust management
- **Email Verification** - Secure account creation and password reset
- **Multi-factor Authentication** - Enhanced security with device verification
- **Smart Code Input** - Enhanced UX with auto-focus and smart paste

### 🛡️ **Security Features**
- **Middleware-based Route Protection** - Server-side authentication checks
- **HttpOnly Cookies** - Secure token storage
- **CSRF Protection** - SameSite cookie policies
- **Real-time Validation** - Immediate feedback and error handling

### 🎨 **User Experience**
- **Modern UI Design** - Clean, responsive interface
- **Real-time Feedback** - Live validation and error clearing
- **Smart Paste Support** - Automatic code extraction from `fingerprint-email-verification:XXXXXX`
- **Loading States** - Visual feedback during API calls
- **Responsive Design** - Works on all device sizes

### 🧩 **Component Architecture**
- **Reusable Components** - Modular, maintainable code structure
- **TypeScript Support** - Full type safety
- **Clean Imports** - Organized component exports

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Backend API endpoint (configured via environment variables)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd decode-frontend-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   BACKEND_URL=your_backend_api_url
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── (auth)/                 # Authentication pages
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── verify-login/      # Device verification
│   │   ├── verify-register/   # Email verification
│   │   ├── forgot-password/   # Password reset request
│   │   ├── verify-forgot/     # Reset code verification
│   │   └── change-password/   # New password setup
│   ├── (app)/                 # Protected application pages
│   │   └── dashboard/         # Main dashboard
│   ├── api/                   # API routes
│   │   └── auth/              # Authentication endpoints
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Business logic services
│   └── middleware.ts          # Route protection middleware
├── components/
│   ├── (auth)/                # Authentication components
│   │   ├── AuthCard.tsx       # Main auth card layout
│   │   ├── BackButton.tsx     # Reusable back navigation
│   │   ├── TextField.tsx      # Standardized text input
│   │   ├── PasswordField.tsx  # Password input with toggle
│   │   ├── PasswordValidation.tsx # Real-time validation
│   │   ├── SubmitButton.tsx   # Loading states button
│   │   ├── BackgroundAccents.tsx # Animated backgrounds
│   │   └── BrandLogos.tsx     # Brand logo display
│   └── (app)/                 # Application components
└── public/
    └── assets/                # Static assets and logos
```

## 🔄 Authentication Flow

### 1. **Login Process**
```
User Login → Device Fingerprint Check → Dashboard OR Verify Device
```

### 2. **Registration Process**
```
User Registration → Email Verification → Account Created → Login
```

### 3. **Password Reset Process**
```
Forgot Password → Email Code → Verify Code → Change Password → Login
```

### 4. **Device Verification Process**
```
Untrusted Device → Email Code → Device Verified → Re-login Required
```

## 🛡️ Security Implementation

### **Middleware Protection**
- **Dashboard Routes**: Requires valid `token` and `refreshToken` cookies
- **Verification Routes**: Requires appropriate verification context
- **Automatic Redirects**: Unauthorized access redirected to login

### **Cookie Management**
- **HttpOnly Tokens**: Secure server-side token storage
- **Automatic Expiration**: Based on backend response
- **CSRF Protection**: SameSite cookie policies
- **Secure Cookies**: Production environment security

### **Device Fingerprinting**
- **Automatic Generation**: On login attempts
- **Backend Validation**: Server-side verification
- **Trust Management**: Email verification for new devices

## 🎯 API Endpoints

### **Authentication Routes**
- `POST /api/auth/login` - User login with device fingerprinting
- `POST /api/auth/register` - User registration with email verification
- `POST /api/auth/verify-login` - Device fingerprint verification
- `POST /api/auth/verify-register` - Email verification for registration
- `POST /api/auth/forgot-password` - Initiate password reset
- `POST /api/auth/verify-forgot` - Verify password reset code
- `POST /api/auth/change-password` - Update user password

### **Response Format**
All API endpoints return consistent JSON responses:
```json
{
  "success": boolean,
  "statusCode": number,
  "message": string,
  "requiresVerification": boolean, // for login
  "requiresRelogin": boolean       // for device verification
}
```

## 🧩 Component Usage

### **BackButton Component**
```tsx
import Auth from '@/components/(auth)';

// Basic usage
<Auth.BackButton href="/login" text="Back to Login" />

// With custom styling
<Auth.BackButton 
  href="/dashboard" 
  text="Back to Dashboard" 
  className="text-center" 
/>
```

### **Form Components**
```tsx
// Text input with validation
<Auth.TextField
  id="email"
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={handleChange}
/>

// Password input with visibility toggle
<Auth.PasswordField
  id="password"
  value={password}
  onChange={handleChange}
  placeholder="Enter your password"
/>

// Submit button with loading states
<Auth.SubmitButton
  loading={isLoading}
  disabled={!isValid}
  loadingText="Processing..."
>
  Submit
</Auth.SubmitButton>
```

## 🔧 Configuration

### **Environment Variables**
```env
# Required
BACKEND_URL=https://your-backend-api.com

# Optional
NODE_ENV=production
```

### **Middleware Configuration**
The middleware automatically protects routes based on the configuration in `src/middleware.ts`:
```typescript
export const config = {
  matcher: [
    '/verify-register',
    '/verify-login', 
    '/dashboard/:path*'
  ],
};
```

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### **Other Platforms**
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🧪 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Code Style**
- **TypeScript**: Full type safety
- **ESLint**: Code quality and consistency
- **Tailwind CSS**: Utility-first styling
- **Component Organization**: Grouped by feature

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the [USERFLOW.md](USERFLOW.md) for detailed flow documentation
- Review the component documentation in the codebase

## 🔮 Roadmap

- [ ] Social login integration
- [ ] Two-factor authentication (2FA)
- [ ] Account management dashboard
- [ ] Advanced security analytics
- [ ] Mobile app integration

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

---