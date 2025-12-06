// middleware.ts (simplified - just reads cookies, doesn't set them)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect farmer API routes
  if (request.nextUrl.pathname.startsWith('/api/farmer/')) {
    
    // Get farmer_id from cookie
    const farmerId = request.cookies.get('farmer_id')?.value;
    const userId = request.cookies.get('user_id')?.value;
    
    console.log('🔐 Middleware checking auth:', {
      farmer_id: farmerId,
      user_id: userId,
      path: request.nextUrl.pathname,
      allCookies: request.cookies.getAll()
    });
    
    // DEVELOPMENT: Fallback for testing
    if (!farmerId && process.env.NODE_ENV === 'development') {
      console.log('🛠️ Development: No farmer_id cookie, using default = 1');
      
      const response = NextResponse.next();
      response.headers.set('x-farmer-id', '1');
      response.headers.set('x-user-id', '1');
      return response;
    }
    
    // PRODUCTION: Require authentication
    if (!farmerId) {
      console.log('❌ No farmer_id cookie found');
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'Please login first',
          redirect: '/login'
        },
        { status: 401 }
      );
    }
    
    // Valid authentication found
    console.log('✅ Authenticated farmer:', farmerId);
    
    const response = NextResponse.next();
    response.headers.set('x-farmer-id', farmerId);
    if (userId) {
      response.headers.set('x-user-id', userId);
    }
    
    return response;
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/farmer/:path*'],
};