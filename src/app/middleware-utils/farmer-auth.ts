// middleware/farmer-auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authenticateUser } from './auth';

/**
 * Middleware that protects farmer-only routes
 */
export async function farmerOnly(request: NextRequest) {  // Make sure it's exported
  // First authenticate the user
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
  
  // Check if user is a farmer
  const userRole = request.headers.get('x-user-role');
  const farmerId = request.headers.get('x-farmer-id');
  
  if (userRole !== 'farmer' || !farmerId) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Access denied.',
        message: 'This route is for farmers only.',
      },
      { status: 403 }
    );
  }
  
  return authResponse;
}

// Make sure to export it
export default farmerOnly; // Optional: default export