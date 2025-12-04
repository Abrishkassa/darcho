import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// Direct MySQL connection
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: " ", // Your MySQL password
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export async function GET() {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();
    
    // Query products table - ensure you're selecting the correct columns
    // If your table has different column names, adjust accordingly
    const [rows] = await connection.query(
      "SELECT id, name, quantity, price FROM products ORDER BY id DESC"
      // If your column is called something else, use: "SELECT id, name, stock as quantity, price FROM products"
    );

    // Log for debugging
    console.log("Fetched products:", rows);

    // Return the data
    return NextResponse.json({ 
      success: true,
      products: rows,
      count: Array.isArray(rows) ? rows.length : 0
    });

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch products",
        details: err instanceof Error ? err.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    // Release the connection back to the pool
    if (connection) connection.release();
  }
}

// Optional: POST method to add products
export async function POST(request: Request) {
  let connection;
  try {
    const body = await request.json();
    const { name, quantity, price } = body;

    connection = await pool.getConnection();
    
    const [result] = await connection.query(
      "INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)",
      [name, quantity, price]
    );

    return NextResponse.json({
      success: true,
      message: "Product added successfully",
      productId: (result as any).insertId
    }, { status: 201 });

  } catch (err) {
    console.error("Database error:", err);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to add product"
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}