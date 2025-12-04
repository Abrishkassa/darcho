// app/api/farmer/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || " ", // Your password here
  database: process.env.DB_NAME || "darcho",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// GET: Fetch all products
export async function GET(request: NextRequest) {
  let connection;
  try {
    // Get connection from pool
    connection = await pool.getConnection();
    
    // Query to fetch products
    // Adjust column names based on your actual table structure
    const [rows] = await connection.query(`
      SELECT 
        id,
        name,
        quantity,
        price,
        category,
        description,
        image_url,
        created_at,
        updated_at
      FROM products 
      WHERE farmer_id = 1 -- Replace with actual farmer ID from authentication
      ORDER BY created_at DESC
    `);

    // Log for debugging
    console.log(`Fetched ${Array.isArray(rows) ? rows.length : 0} products`);

    return NextResponse.json({
      success: true,
      products: rows,
      count: Array.isArray(rows) ? rows.length : 0,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("Database error in GET /api/farmer/products:", error);
    
    // Provide mock data if database query fails (for testing)
    const mockProducts = [
      {
        id: 1,
        name: "Premium Coffee Beans",
        quantity: 50,
        price: 1200,
        category: "Coffee",
        description: "High-quality Arabica coffee beans",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Arabica Special Blend",
        quantity: 30,
        price: 1500,
        category: "Coffee",
        description: "Special blend of Arabica beans",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Robusta Coffee",
        quantity: 25,
        price: 1000,
        category: "Coffee",
        description: "Strong Robusta coffee beans",
        image_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed. Showing mock data.",
        message: error.message,
        products: mockProducts,
        count: mockProducts.length,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    // Release connection back to pool
    if (connection) connection.release();
  }
}

// POST: Add a new product
export async function POST(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    
    // Validate required fields
    const { name, quantity, price } = body;
    if (!name || quantity === undefined || price === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, quantity, and price are required",
        },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof name !== "string" || 
        typeof quantity !== "number" || 
        typeof price !== "number") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data types",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Insert new product
    const [result] = await connection.query(
      `INSERT INTO products (
        farmer_id, 
        name, 
        quantity, 
        price, 
        category, 
        description, 
        image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        1, // Replace with actual farmer ID from authentication
        name,
        quantity,
        price,
        body.category || null,
        body.description || null,
        body.image_url || null,
      ]
    );

    // Get the inserted product ID
    const insertId = (result as any).insertId;

    // Fetch the newly created product
    const [newProductRows] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [insertId]
    );

    const newProduct = Array.isArray(newProductRows) ? newProductRows[0] : null;

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully",
        product: newProduct,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error("Database error in POST /api/farmer/products:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add product",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// PUT: Update a product
export async function PUT(request: NextRequest) {
  let connection;
  try {
    const body = await request.json();
    const { id, name, quantity, price, category, description } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // Update product
    const [result] = await connection.query(
      `UPDATE products 
       SET 
         name = COALESCE(?, name),
         quantity = COALESCE(?, quantity),
         price = COALESCE(?, price),
         category = COALESCE(?, category),
         description = COALESCE(?, description),
         updated_at = NOW()
       WHERE id = ? AND farmer_id = 1`, // Replace farmer_id with actual auth
      [name, quantity, price, category, description, id]
    );

    const affectedRows = (result as any).affectedRows;

    if (affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found or you don't have permission to update it",
        },
        { status: 404 }
      );
    }

    // Fetch updated product
    const [updatedProductRows] = await connection.query(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    const updatedProduct = Array.isArray(updatedProductRows) ? updatedProductRows[0] : null;

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });

  } catch (error: any) {
    console.error("Database error in PUT /api/farmer/products:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// DELETE: Delete a product
export async function DELETE(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Product ID is required",
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();

    // First, fetch the product to return in response
    const [productRows] = await connection.query(
      "SELECT * FROM products WHERE id = ? AND farmer_id = 1", // Replace farmer_id with actual auth
      [id]
    );

    const product = Array.isArray(productRows) ? productRows[0] : null;

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: "Product not found or you don't have permission to delete it",
        },
        { status: 404 }
      );
    }

    // Delete the product
    const [result] = await connection.query(
      "DELETE FROM products WHERE id = ? AND farmer_id = 1", // Replace farmer_id with actual auth
      [id]
    );

    const affectedRows = (result as any).affectedRows;

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
      product: product, // Return the deleted product
    });

  } catch (error: any) {
    console.error("Database error in DELETE /api/farmer/products:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}