import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('MIDDLEWARE EXECUTING FOR:', pathname);
  
  // Protect dashboard routes - check for authentication tokens
  if (pathname.startsWith('/dashboard')) {
    console.log('CHECKING DASHBOARD ACCESS...');
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    console.log('AccessToken present:', !!accessToken);
    console.log('RefreshToken present:', !!refreshToken);

    if (!accessToken || !refreshToken) {
      console.log('Missing tokens, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If user has valid tokens, allow access to dashboard
    console.log('Dashboard access granted - valid tokens present');
    const response = NextResponse.next();
    
    // Clear the from_success cookie if it exists (cleanup)
    const fromSuccess = request.cookies.get('from_success')?.value;
    if (fromSuccess === '1') {
      response.cookies.set('from_success', '', { maxAge: 0, path: '/' });
    }
    
    return response;
  }
  
  // Protect verify routes - check for verification context
  if (pathname === '/verify-login') {
    console.log('CHECKING VERIFY-LOGIN ACCESS...');
    const hasVerificationContext = request.cookies.get('login_email') || 
                                  request.headers.get('referer')?.includes('/login') ||
                                  request.headers.get('referer')?.includes('/api/auth/login');
    
    console.log('Verification context:', hasVerificationContext);
    
    if (!hasVerificationContext) {
      console.log('No verification context, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (pathname === '/verify-register') {
    console.log('CHECKING VERIFY-REGISTER ACCESS...');
    const hasVerificationContext = request.cookies.get('verification_required') || 
                                  request.cookies.get('registration_data') ||
                                  request.headers.get('referer')?.includes('/register') ||
                                  request.headers.get('referer')?.includes('/api/auth/register');
    
    console.log('Verification context:', hasVerificationContext);
    
    if (!hasVerificationContext) {
      console.log('No verification context, redirecting to login');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/verify-register',
    '/verify-login', 
    '/dashboard/:path*'
  ],
};
