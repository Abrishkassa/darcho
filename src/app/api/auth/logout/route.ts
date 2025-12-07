import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import type { NextRequest } from 'next/server';

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper to get session ID
function getSessionId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Session ')) {
    return authHeader.substring(8);
  }
  return null;
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const sessionId = getSessionId(request);
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Session ID required" 
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Delete the session
    await connection.query(
      'DELETE FROM sessions WHERE id = ?',
      [sessionId]
    );
    
    // Clear user's current session
    await connection.query(
      'UPDATE users SET current_session_id = NULL WHERE current_session_id = ?',
      [sessionId]
    );
    
    return NextResponse.json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err: any) {
    console.error("Logout error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Logout failed" 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}