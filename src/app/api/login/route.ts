import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

// Create session function
async function createSession(userId: number, request: NextRequest): Promise<string | null> {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Generate session ID
    const sessionId = crypto.randomBytes(64).toString('hex');
    
    // Get IP address
    let ipAddress = 'unknown';
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      ipAddress = forwardedFor.split(',')[0].trim();
    } else {
      const realIp = request.headers.get('x-real-ip');
      if (realIp) ipAddress = realIp;
    }
    
    // Get user agent
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Calculate expiration (2 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 2);
    
    console.log("Creating session for user:", userId);
    
    // Check/create sessions table
    try {
      await connection.query("SELECT 1 FROM sessions LIMIT 1");
    } catch (error) {
      // Create sessions table if it doesn't exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id VARCHAR(128) PRIMARY KEY,
          user_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME NOT NULL,
          ip_address VARCHAR(45),
          user_agent TEXT,
          INDEX idx_session_id (id),
          INDEX idx_user_id (user_id),
          INDEX idx_expires_at (expires_at)
        )
      `);
      console.log("Created sessions table");
    }
    
    // Insert session into database
    await connection.query(
      `INSERT INTO sessions (id, user_id, expires_at, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, userId, expiresAt, ipAddress, userAgent]
    );
    
    console.log("Session created successfully");
    return sessionId;
  } catch (error: any) {
    console.error("Error creating session:", error.message);
    return null;
  } finally {
    if (connection) connection.release();
  }
}

export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { phone, password } = body;

    console.log("Login attempt:", { 
      phone: phone?.substring(0, 20), 
      passwordLength: password?.length 
    });
    
    if (!phone || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Phone number and password are required" 
        },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    console.log("Cleaned phone:", cleanPhone);

    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { 
          success: false,
          error: "Phone number must be at least 10 digits" 
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Find user by phone number
    const [users] = await connection.query(
      `SELECT * FROM users WHERE phone = ? LIMIT 1`,
      [cleanPhone]
    );

    const userList = users as any[];
    
    if (userList.length === 0) {
      console.log("No user found with phone:", cleanPhone);
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid phone number or password" 
        },
        { status: 401 }
      );
    }

    const user = userList[0];
    console.log("User found:", { 
      id: user.id, 
      phone: user.phone,
      hasPasswordField: !!user.password,
      passwordValue: user.password ? "***" : "NULL"
    });
    
    // Check if user has password field
    if (!user.password) {
      console.error("User has no password field or it's empty:", user.id);
      return NextResponse.json(
        { 
          success: false,
          error: "Account configuration error - no password set" 
        },
        { status: 500 }
      );
    }
    
    // SIMPLE PASSWORD COMPARISON (plain text)
    const passwordValid = password === user.password;
    console.log("Password comparison result:", passwordValid);
    
    if (!passwordValid) {
      console.log("Password mismatch. Entered:", password, "Stored:", user.password);
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid phone number or password" 
        },
        { status: 401 }
      );
    }

    // Create session
    const sessionId = await createSession(user.id, request);
    
    // Get farmer info if exists
    let farmerInfo = null;
    try {
      const [farmers] = await connection.query(
        'SELECT id, fullname FROM farmers WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      
      const farmerList = farmers as any[];
      farmerInfo = farmerList.length > 0 ? farmerList[0] : null;
    } catch (farmerError) {
      console.log("No farmer info found");
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email || null,
        fullname: user.fullname || null,
        role: user.role || 'user'
      },
      farmer: farmerInfo,
      session: {
        id: sessionId || 'temporary',
        expires_in: sessionId ? "2 hours" : "browser session only"
      },
      auth_header: sessionId ? `Session ${sessionId}` : "Session temporary"
    });

  } catch (err: any) {
    console.error("Login error:", err);
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