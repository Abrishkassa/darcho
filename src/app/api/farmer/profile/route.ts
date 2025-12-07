import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

// Helper to get user_id (same as profile route)
async function getUserId(request: Request): Promise<number | null> {
  try {
    // Get from cookie based on your logs
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split('; ').map(c => c.split('='))
      );
      
      if (cookies.user_id) {
        const userId = parseInt(cookies.user_id);
        if (!isNaN(userId)) return userId;
      }
    }
    
    // Default for testing
    console.log("Using default user_id 11 for testing");
    return 11;
    
  } catch (err) {
    console.error("Error getting user_id:", err);
    return null;
  }
}

// Helper to get farmer_id from user_id
async function getFarmerIdFromUserId(userId: number, connection: any): Promise<number | null> {
  try {
    const [rows] = await connection.query(
      `SELECT id FROM farmers WHERE user_id = ? LIMIT 1`,
      [userId]
    );
    
    const farmers = rows as any[];
    if (farmers.length > 0) {
      return farmers[0].id;
    }
    
    return null;
    
  } catch (err) {
    console.error("Error getting farmer_id:", err);
    return null;
  }
}

// GET - Fetch all products for the farmer
export async function GET(request: Request) {
  let connection;
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }

    connection = await pool.getConnection();
    
    // Get farmer_id for this user
    const farmerId = await getFarmerIdFromUserId(userId, connection);
    if (!farmerId) {
      return NextResponse.json({ 
        success: true,
        products: [],
        message: "No farmer profile found"
      });
    }

    console.log(`🌾 Fetching products for farmer_id: ${farmerId} (user_id: ${userId})`);
    
    // First, ensure products table has all required columns
    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          farmer_id INT NOT NULL,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'Other',
          price DECIMAL(10,2) DEFAULT 0,
          quantity INT DEFAULT 0,
          unit VARCHAR(20) DEFAULT 'kg',
          description TEXT,
          image_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_farmer_id (farmer_id)
        )
      `);
    } catch (err) {
      console.log("Products table already exists or error creating:", err);
    }
    
    // Fetch products
    const [rows] = await connection.query(
      `SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC, id DESC`,
      [farmerId]
    );
    
    const products = rows as any[];
    console.log(`✅ Found ${products.length} products for farmer ${farmerId}`);
    
    // Format products with proper data types
    const formattedProducts = products.map(product => ({
      id: product.id,
      farmer_id: product.farmer_id,
      name: product.name || '',
      category: product.category || 'Other',
      price: Number(product.price) || 0,
      quantity: Number(product.quantity) || 0,
      unit: product.unit || 'kg',
      description: product.description || '',
      image_url: product.image_url || '',
      created_at: product.created_at || product.date_added || new Date().toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      products: formattedProducts
    });

  } catch (err: any) {
    console.error("Database error:", err);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch products",
        products: []
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// POST - Add a new product
export async function POST(request: Request) {
  let connection;
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      category = 'Other', 
      price = 0, 
      quantity = 0, 
      unit = 'kg', 
      description = '' 
    } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { 
          success: false,
          error: "Product name is required" 
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Get farmer_id for this user
    const farmerId = await getFarmerIdFromUserId(userId, connection);
    if (!farmerId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Please create your farmer profile first" 
        },
        { status: 404 }
      );
    }

    console.log(`➕ Adding product for farmer_id: ${farmerId}`);
    
    // Insert new product
    const [result] = await connection.query(
      `INSERT INTO products (
        farmer_id, name, category, price, quantity, unit, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [farmerId, name.trim(), category, Number(price), Number(quantity), unit, description]
    );

    const productId = (result as any).insertId;
    
    // Get the newly created product
    const [newProductRows] = await connection.query(
      `SELECT * FROM products WHERE id = ?`,
      [productId]
    );

    const newProduct = (newProductRows as any[])[0];
    
    // Format response
    const formattedProduct = {
      id: newProduct.id,
      farmer_id: newProduct.farmer_id,
      name: newProduct.name,
      category: newProduct.category || 'Other',
      price: Number(newProduct.price) || 0,
      quantity: Number(newProduct.quantity) || 0,
      unit: newProduct.unit || 'kg',
      description: newProduct.description || '',
      image_url: newProduct.image_url || '',
      created_at: newProduct.created_at
    };

    return NextResponse.json({ 
      success: true,
      message: "Product added successfully",
      product: formattedProduct
    }, { status: 201 });

  } catch (err: any) {
    console.error("Database error:", err);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to add product: " + (err.message || 'Unknown error')
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// PUT - Update a product
export async function PUT(request: Request) {
  let connection;
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");
    
    if (!productId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Product ID is required" 
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      name, 
      category, 
      price, 
      quantity, 
      unit, 
      description 
    } = body;

    connection = await pool.getConnection();
    
    // Get farmer_id for this user
    const farmerId = await getFarmerIdFromUserId(userId, connection);
    if (!farmerId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Farmer profile not found" 
        },
        { status: 404 }
      );
    }

    // Update product (only if it belongs to this farmer)
    const [result] = await connection.query(
      `UPDATE products 
       SET name = ?, category = ?, price = ?, quantity = ?, 
           unit = ?, description = ?, updated_at = NOW()
       WHERE id = ? AND farmer_id = ?`,
      [
        name?.trim() || '', 
        category || 'Other', 
        Number(price) || 0, 
        Number(quantity) || 0,
        unit || 'kg', 
        description || '',
        productId, 
        farmerId
      ]
    );

    const affectedRows = (result as any).affectedRows;
    
    if (affectedRows === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Product not found or you don't have permission to update it" 
        },
        { status: 404 }
      );
    }

    // Fetch updated product
    const [updatedProductRows] = await connection.query(
      `SELECT * FROM products WHERE id = ?`,
      [productId]
    );

    const updatedProduct = (updatedProductRows as any[])[0];
    
    // Format response
    const formattedProduct = {
      id: updatedProduct.id,
      farmer_id: updatedProduct.farmer_id,
      name: updatedProduct.name,
      category: updatedProduct.category || 'Other',
      price: Number(updatedProduct.price) || 0,
      quantity: Number(updatedProduct.quantity) || 0,
      unit: updatedProduct.unit || 'kg',
      description: updatedProduct.description || '',
      image_url: updatedProduct.image_url || '',
      created_at: updatedProduct.created_at,
      updated_at: updatedProduct.updated_at
    };

    return NextResponse.json({ 
      success: true,
      message: "Product updated successfully",
      product: formattedProduct
    });

  } catch (err: any) {
    console.error("Database error:", err);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update product"
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}

// DELETE - Remove a product
export async function DELETE(request: Request) {
  let connection;
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Product ID is required" 
        },
        { status: 400 }
      );
    }

    connection = await pool.getConnection();
    
    // Get farmer_id for this user
    const farmerId = await getFarmerIdFromUserId(userId, connection);
    if (!farmerId) {
      return NextResponse.json(
        { 
          success: false,
          error: "Farmer profile not found" 
        },
        { status: 404 }
      );
    }

    // First, check if product exists and belongs to farmer
    const [checkRows] = await connection.query(
      `SELECT id FROM products WHERE id = ? AND farmer_id = ?`,
      [productId, farmerId]
    );

    if ((checkRows as any[]).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "Product not found or you don't have permission to delete it" 
        },
        { status: 404 }
      );
    }
    
    // Delete product
    await connection.query(
      `DELETE FROM products WHERE id = ? AND farmer_id = ?`,
      [productId, farmerId]
    );

    return NextResponse.json({ 
      success: true,
      message: "Product deleted successfully" 
    });

  } catch (err: any) {
    console.error("Database error:", err);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete product"
      },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}