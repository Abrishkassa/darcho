// middleware/buyer-auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateUser } from './auth';

/**
 * Middleware that protects buyer-only routes
 */
export async function buyerOnly(request: NextRequest) {
  const authResponse = await authenticateUser(request);
  
  if (!authResponse) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized. Please login.',
      },
      { status: 401 }
    );
  }
  
  // Check if user is a buyer
  const userRole = request.headers.get('x-user-role');
  const buyerId = request.headers.get('x-buyer-id');
  
  if (userRole !== 'buyer' || !buyerId) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Access denied.',
        message: 'This route is for buyers only.',
        userRole,
        buyerId
      },
      { status: 403 }
    );
  }
  
  return authResponse;
}