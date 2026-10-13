import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get('mb_role')?.value;
  const userId = request.cookies.get('mb_user_id')?.value;
  const isAuthenticated = Boolean(userId);

  // 1. Redirect already logged-in users away from auth pages
  if (pathname === '/login' || pathname === '/register') {
    if (isAuthenticated) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (role === 'shopper') {
        return NextResponse.redirect(new URL('/shopper', request.url));
      }
      if (role === 'rider') {
        return NextResponse.redirect(new URL('/rider', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Helper redirect to login
  const redirectToLogin = () => {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  };

  // 2. Protect Admin Console
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      return redirectToLogin();
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 3. Protect Shopper Portal
  if (pathname.startsWith('/shopper')) {
    if (!isAuthenticated) {
      return redirectToLogin();
    }
    if (role !== 'shopper' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 4. Protect Rider Portal
  if (pathname.startsWith('/rider')) {
    if (!isAuthenticated) {
      return redirectToLogin();
    }
    if (role !== 'rider' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 5. Customer Dashboard & Guest Ordering
  if (pathname.startsWith('/dashboard')) {
    // Allow guest customers to create orders and view their order list/tracking
    if (pathname === '/dashboard/new-order' || pathname.startsWith('/dashboard/orders')) {
      return NextResponse.next();
    }
    // Protect personal customer settings & wallet
    if (!isAuthenticated) {
      return redirectToLogin();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/shopper/:path*',
    '/rider/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
