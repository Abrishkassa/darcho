// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { farmerOnly } from './app/middleware-utils/farmer-auth';
// import { farmerOnly } from './middleware'; // From index.ts

export async function middleware(request: NextRequest) {
  // Development bypass for testing
  if (process.env.NODE_ENV === 'development') {
    const headers = new Headers(request.headers);
    headers.set('x-farmer-id', '1');
    headers.set('x-user-id', '1');
    headers.set('x-user-role', 'farmer');
    
    return NextResponse.next({
      request: { headers: headers }
    });
  }
  
  // Protect farmer API routes
  if (request.nextUrl.pathname.startsWith('/api/farmer/')) {
    return farmerOnly(request);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/farmer/:path*',
  ],
};