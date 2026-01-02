import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Simply pass through for now
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*', // Only run on API routes
};