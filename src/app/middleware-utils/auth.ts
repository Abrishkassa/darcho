// middleware/auth.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';

/**
 * Main authentication middleware
 * Validates user session and adds user info to request headers
 */
export async function authenticateUser(request: NextRequest): Promise<NextResponse | null> {
  try {
    // Get session/token from request
    const sessionCookie = request.cookies.get('session')?.value;
    const authHeader = request.headers.get('authorization');
    
    let userId: number | null = null;
    let token: string | null = null;
    
    // Check for session cookie
    if (sessionCookie) {
      userId = parseInt(sessionCookie);
      token = sessionCookie;
    }
    
    // Check for Bearer token
    else if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
      // Simple token parsing - assuming token is user ID for now
      userId = parseInt(token) || null;
    }
    
    // No authentication found
    if (!userId || isNaN(userId) || !token) {
      return null;
    }
    
    // Connect to DB to verify user
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'darcho',
    });
    
    // Get user data with role
    const [users]: any = await db.execute(
      `SELECT 
         u.id,
         u.fullname,
         u.email,
         u.phone,
         u.role,
         u.region,
         u.residence,
         f.id as farmer_id,
         b.id as buyer_id
       FROM users u
       LEFT JOIN farmers f ON f.user_id = u.id
       LEFT JOIN buyers b ON b.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );
    
    await db.end();
    
    if (users.length === 0) {
      return null;
    }
    
    const user = users[0];
    
    // Add user info to request headers
    const headers = new Headers(request.headers);
    headers.set('x-user-id', user.id.toString());
    headers.set('x-user-role', user.role);
    headers.set('x-user-name', user.fullname);
    headers.set('x-user-email', user.email || '');
    headers.set('x-user-phone', user.phone);
    
    // Add role-specific IDs
    if (user.role === 'farmer' && user.farmer_id) {
      headers.set('x-farmer-id', user.farmer_id.toString());
    }
    
    if (user.role === 'buyer' && user.buyer_id) {
      headers.set('x-buyer-id', user.buyer_id.toString());
    }
    
    return NextResponse.next({
      request: {
        headers: headers,
      },
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Middleware that protects routes requiring authentication
 */
export async function withAuth(request: NextRequest) {
  const authResponse = await authenticateUser(request);
  
  if (!authResponse) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Unauthorized. Please login.',
        message: 'No valid session found. Please login first.'
      },
      { status: 401 }
    );
  }
  
  return authResponse;
}