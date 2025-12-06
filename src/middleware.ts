// middleware.ts (in root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log('🔧 Middleware running for:', request.nextUrl.pathname);
  
  if (request.nextUrl.pathname.startsWith('/api/farmer/')) {
    console.log('🔧 Setting farmer headers...');
    
    const headers = new Headers(request.headers);
    headers.set('x-farmer-id', '4');
    headers.set('x-user-id', '7');
    headers.set('x-user-role', 'farmer');
    
    console.log('🔧 Headers set:', {
      'x-farmer-id': headers.get('x-farmer-id'),
      'x-user-id': headers.get('x-user-id'),
      'x-user-role': headers.get('x-user-role')
    });
    
    return NextResponse.next({
      request: { headers: headers }
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/farmer/:path*'],
};