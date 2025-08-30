import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect verify-register route from direct access
  if (pathname === '/verify-register') {
    // Check if user has verification context
    const hasVerificationContext = request.cookies.get('verification_required') || 
                                  request.headers.get('referer')?.includes('/login') ||
                                  request.headers.get('referer')?.includes('/api/auth/login');
    
    if (!hasVerificationContext) {
      // Redirect to login if no verification context
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('token')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!token || !refreshToken) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const fromSuccess = request.cookies.get('from_success')?.value;
    if (fromSuccess !== '1') {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    const response = NextResponse.next();
    response.cookies.set('from_success', '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/verify-register',
    '/dashboard/:path*'
  ],
};
