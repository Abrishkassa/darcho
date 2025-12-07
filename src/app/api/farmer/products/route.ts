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

// Get user ID from headers (set by middleware)
function getUserIdFromHeaders(request: Request): number {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    throw new Error("User ID not found in request headers");
  }
  return parseInt(userId);
}

// Get farmer ID from headers
function getFarmerIdFromHeaders(request: Request): number {
  const farmerId = request.headers.get('x-farmer-id');
  if (!farmerId) {
    throw new Error("Farmer ID not found in request headers");
  }
  return parseInt(farmerId);
}

// GET - Fetch all products for the farmer
export async function GET(request: Request) {
  let connection;
  try {
    // Get IDs from headers (already verified by middleware)
    const userId = getUserIdFromHeaders(request);
    const farmerId = getFarmerIdFromHeaders(request);

    console.log(`🌾 Fetching products for farmer_id: ${farmerId} (user_id: ${userId})`);
    
    connection = await pool.getConnection();
    
    // Fetch products
    const [rows] = await connection.query(
      `SELECT * FROM products WHERE farmer_id = ? ORDER BY created_at DESC, id DESC`,
      [farmerId]
    );
    
    const products = rows as any[];
    console.log(`✅ Found ${products.length} products for farmer ${farmerId}`);
    
    // Format products
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
      created_at: product.created_at
    }));

    return NextResponse.json({ 
      success: true,
      products: formattedProducts
    });

  } catch (err: any) {
    console.error("Database error:", err);
    
    // Handle authentication errors
    if (err.message.includes("not found in request headers")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }
    
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
    // Get IDs from headers
    const userId = getUserIdFromHeaders(request);
    const farmerId = getFarmerIdFromHeaders(request);

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
    
    console.log(`➕ Adding product for farmer_id: ${farmerId} (user_id: ${userId})`);
    
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
    
    // Handle authentication errors
    if (err.message.includes("not found in request headers")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Authentication required" 
        },
        { status: 401 }
      );
    }
    
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

// Similar updates for PUT and DELETE methods...