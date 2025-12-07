import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import mysql from 'mysql2/promise';
import { randomBytes } from 'crypto';

// Database connection for middleware
const dbPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 5,
});

// Helper to get session ID from request
function getSessionId(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Session ')) {
    return authHeader.substring(8);
  }
  
  // Try custom header
  const sessionHeader = request.headers.get('x-session-id');
  if (sessionHeader) {
    return sessionHeader;
  }
  
  return null;
}

// Verify session and get user/farmer info
async function verifySession(sessionId: string, request: NextRequest): Promise<{ userId: number; farmerId: number } | null> {
  let connection;
  try {
    connection = await dbPool.getConnection();
    
    // Clean up expired sessions first
    await connection.query(
      'DELETE FROM sessions WHERE expires_at < NOW()'
    );
    
    // Get session with user info
    const [sessions] = await connection.query(
      `SELECT s.*, u.username, f.id as farmer_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       LEFT JOIN farmers f ON s.user_id = f.user_id
       WHERE s.id = ? AND s.expires_at > NOW()
       LIMIT 1`,
      [sessionId]
    );
    
    const sessionList = sessions as any[];
    
    if (sessionList.length === 0) {
      console.log('❌ Invalid or expired session');
      return null;
    }
    
    const session = sessionList[0];
    
    // Update session last activity (optional)
    await connection.query(
      'UPDATE sessions SET expires_at = DATE_ADD(NOW(), INTERVAL 2 HOUR) WHERE id = ?',
      [sessionId]
    );
    
    return {
      userId: session.user_id,
      farmerId: session.farmer_id || 0 // 0 if no farmer profile yet
    };
    
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Create a new session
export async function createSession(userId: number, request: NextRequest): Promise<string | null> {
  let connection;
  try {
    connection = await dbPool.getConnection();
    
    // Generate unique session ID
    const sessionId = randomBytes(64).toString('hex');
    
    // Get user IP and agent
    //const ipAddress = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Get farmer ID if exists
    const [farmers] = await connection.query(
      'SELECT id FROM farmers WHERE user_id = ? LIMIT 1',
      [userId]
    );
    
    const farmerList = farmers as any[];
    const farmerId = farmerList.length > 0 ? farmerList[0].id : null;
    
    // Create session (expires in 2 hours)
    await connection.query(
      `INSERT INTO sessions (id, user_id, farmer_id, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))`,
      [sessionId, userId, farmerId,  userAgent]
    );
    
    // Update user's current session
    await connection.query(
      'UPDATE users SET current_session_id = ? WHERE id = ?',
      [sessionId, userId]
    );
    
    return sessionId;
    
  } catch (error) {
    console.error('Session creation error:', error);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

// Main middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Only protect farmer API routes
  if (pathname.startsWith('/api/farmer/')) {
    console.log('🔐 Middleware checking session for:', pathname);
    
    // Get session ID from request
    const sessionId = getSessionId(request);
    
    if (!sessionId) {
      console.log('❌ No session ID provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Session required',
          message: 'Please include Session token in Authorization header',
          required_header: 'Authorization: Session <session-id>'
        },
        { status: 401 }
      );
    }
    
    // Verify session
    const sessionInfo = await verifySession(sessionId, request);
    
    if (!sessionInfo) {
      console.log('❌ Invalid session');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid session',
          message: 'Session expired or invalid. Please login again.'
        },
        { status: 401 }
      );
    }
    
    const { userId, farmerId } = sessionInfo;
    console.log(`✅ Valid session: User ${userId}, Farmer ${farmerId}`);
    
    // Clone request headers and add user info
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', userId.toString());
    requestHeaders.set('x-farmer-id', farmerId.toString());
    requestHeaders.set('x-session-id', sessionId);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/farmer/:path*'],
};