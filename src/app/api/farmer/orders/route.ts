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
    
    // Assuming you have an 'orders' table
    const [rows] = await connection.query(`
      SELECT 
        o.id,
        o.buyer_name as buyer,
        p.name as product,
        o.quantity,
        o.status
      FROM orders o
      JOIN products p ON o.product_id = p.id
      ORDER BY o.created_at DESC
    `);

    return NextResponse.json({ 
      success: true,
      orders: rows 
    });

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch orders" 
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}