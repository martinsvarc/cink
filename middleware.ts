import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/models', '/clients', '/cashflow', '/analytics', '/admin', '/charts', '/monetization', '/stream', '/training'];

// Define public routes that don't require authentication
const publicRoutes = ['/auth', '/api/auth/login', '/api/auth/register', '/api/auth/check'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow access to API routes (except auth routes which are handled above)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // Get the auth token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // No token, redirect to auth page
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Verify the token
    const payload = await verifyToken(token);
    
    if (!payload) {
      // Invalid token, redirect to auth page
      const response = NextResponse.redirect(new URL('/auth', request.url));
      // Clear the invalid token
      response.cookies.delete('auth-token');
      return response;
    }

    // Token is valid, allow access
    return NextResponse.next();
  }

  // For the root path, redirect to dashboard (which will then be handled by the auth check)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For any other routes, allow access
  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs', // Force Node.js runtime instead of Edge Runtime for JWT support
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 