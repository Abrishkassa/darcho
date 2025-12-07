import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from 'bcryptjs';
import type { NextRequest } from 'next/server';
import { createSession } from '@/middleware';

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { phone, password } = body; // Changed from username to phone

    if (!phone || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Phone number and password are required" 
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Find user by phone number
    const [users] = await connection.query(
      `SELECT * FROM users WHERE phone = ? LIMIT 1`, // Changed to phone only
      [phone]
    );

    const userList = users as any[];
    
    if (userList.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid credentials" 
        },
        { status: 401 }
      );
    }

    const user = userList[0];
    
    // Check if user has password field (debug logging)
    console.log("User object:", {
      id: user.id,
      phone: user.phone,
      hasPassword: !!user.password,
      hasPasswordHash: !!user.password_hash,
      columns: Object.keys(user)
    });

    // Determine the correct password field name
    const passwordHash = user.password_hash || user.password;
    
    if (!passwordHash) {
      console.error("No password hash found in user record");
      return NextResponse.json(
        { 
          success: false,
          error: "Account configuration error" 
        },
        { status: 500 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, passwordHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid credentials" 
        },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = await createSession(user.id, request);
    
    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to create session" 
        },
        { status: 500 }
      );
    }

    // Get farmer info if exists
    const [farmers] = await connection.query(
      'SELECT id, fullname FROM farmers WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    
    const farmerList = farmers as any[];
    const farmerInfo = farmerList.length > 0 ? farmerList[0] : null;

    // Return session info (NO COOKIES)
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username || user.phone, // Use phone as username if username doesn't exist
        phone: user.phone,
        email: user.email || null,
        role: user.role || 'user'
      },
      farmer: farmerInfo,
      session: {
        id: sessionId,
        expires_in: "2 hours"
      },
      auth_header: `Session ${sessionId}`
    });

  } catch (err: any) {
    console.error("Login error details:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Login failed",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}