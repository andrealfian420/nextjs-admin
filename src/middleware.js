import { NextResponse } from 'next/server';

// This middleware checks for the presence of a refresh token cookie to determine if the user is authenticated.
// It redirects unauthenticated users trying to access admin routes to the login page,
// and redirects authenticated users trying to access login or forgot-password pages to the admin dashboard.
export function middleware(request) {
  const token = request.cookies.get('refreshToken')?.value;
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  const isAuthPath =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/forgot-password');

  if (isAdminPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/forgot-password'],
};
