import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: " ",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Assuming you have a 'farmers' table
    const [rows] = await connection.query(`
      SELECT 
        id,
        fullname,
        phone,
        email,
        region,
        residence,
        farm_size,
        years_farming,
        created_at as joined_date
      FROM farmers
      WHERE id = 1 -- Replace with actual farmer ID from session/auth
      LIMIT 1
    `);

    const profiles = rows as any[];
    
    return NextResponse.json({ 
      success: true,
      profile: profiles[0] || null 
    });

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch profile" 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

export async function PUT(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { fullname, phone, email, region, residence, farm_size, years_farming } = body;

    connection = await pool.getConnection();
    
    // Update farmer profile
    await connection.query(`
      UPDATE farmers 
      SET 
        fullname = ?,
        phone = ?,
        email = ?,
        region = ?,
        residence = ?,
        farm_size = ?,
        years_farming = ?,
        updated_at = NOW()
      WHERE id = 1 -- Replace with actual farmer ID from session/auth
    `, [fullname, phone, email, region, residence, farm_size, years_farming]);

    return NextResponse.json({ 
      success: true,
      message: "Profile updated successfully" 
    });

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update profile" 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}