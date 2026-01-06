import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const pathname = request.nextUrl.pathname;
  
  // IMPORTANT: Skip middleware for NextAuth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }
  
  // Your middleware logic for other API routes
  const response = NextResponse.next();
  
  // Optional: Add headers for other API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  
  return response;
}

export const config = {
  matcher: '/api/:path*',
};