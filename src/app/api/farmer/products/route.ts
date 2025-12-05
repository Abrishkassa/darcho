// app/api/farmer/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
export const runtime = 'nodejs';

// GET: Fetch products for authenticated farmer
export async function GET(request: NextRequest) {
  let db;
  try {
    // Get farmer_id from middleware (automatically added to headers)
    const farmerId = request.headers.get('x-farmer-id');
    const userId = request.headers.get('x-user-id');
    
    if (!farmerId || !userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Authentication required. Farmer ID not found." 
        }, 
        { status: 401 }
      );
    }

    // DB CONNECTION
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "darcho",
    });

    // FETCH PRODUCTS for this farmer
    const [products]: any = await db.execute(
      `SELECT 
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
      WHERE farmer_id = ?
      ORDER BY created_at DESC`,
      [parseInt(farmerId)]
    );

    // Get farmer info
    const [farmerInfo]: any = await db.execute(
      `SELECT f.farm_name, f.farm_address, f.farm_phone, f.certification
       FROM farmers f 
       WHERE f.id = ?`,
      [parseInt(farmerId)]
    );

    await db.end();

    return NextResponse.json(
      { 
        success: true, 
        farmer: farmerInfo[0] || {},
        products: products,
        count: products.length 
      }, 
      { status: 200 }
    );

  } catch (err: any) {
    console.error("PRODUCTS FETCH ERROR:", err);
    
    if (db) await db.end();
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch products",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }, 
      { status: 500 }
    );
  }
}

// POST: Create new product
export async function POST(request: NextRequest) {
  let db;
  try {
    // Get farmer_id from middleware
    const farmerId = request.headers.get('x-farmer-id');
    
    if (!farmerId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, quantity, price, category, description, image_url } = body;

    // VALIDATION
    if (!name || quantity === undefined || price === undefined) {
      return NextResponse.json(
        { error: "Name, quantity, and price are required" }, 
        { status: 400 }
      );
    }

    if (quantity < 0 || price < 0) {
      return NextResponse.json(
        { error: "Quantity and price must be positive values" }, 
        { status: 400 }
      );
    }

    // DB CONNECTION
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "darcho",
    });

    // INSERT PRODUCT
    const [result]: any = await db.execute(
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
        parseInt(farmerId),
        name,
        parseFloat(quantity),
        parseFloat(price),
        category || null,
        description || null,
        image_url || null,
      ]
    );

    // GET THE NEWLY CREATED PRODUCT
    const [newProduct]: any = await db.execute(
      "SELECT * FROM products WHERE id = ?",
      [result.insertId]
    );

    await db.end();

    return NextResponse.json(
      { 
        success: true, 
        message: "Product added successfully",
        product: newProduct[0] 
      }, 
      { status: 201 }
    );

  } catch (err: any) {
    console.error("PRODUCT CREATE ERROR:", err);
    
    if (db) await db.end();
    
    return NextResponse.json(
      { 
        error: "Failed to create product",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      }, 
      { status: 500 }
    );
  }
}

// PUT: Update product
export async function PUT(request: NextRequest) {
  let db;
  try {
    const farmerId = request.headers.get('x-farmer-id');
    
    if (!farmerId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, quantity, price, category, description, image_url } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" }, 
        { status: 400 }
      );
    }

    // DB CONNECTION
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "darcho",
    });

    // UPDATE PRODUCT
    const [result]: any = await db.execute(
      `UPDATE products 
       SET 
         name = COALESCE(?, name),
         quantity = COALESCE(?, quantity),
         price = COALESCE(?, price),
         category = COALESCE(?, category),
         description = COALESCE(?, description),
         image_url = COALESCE(?, image_url),
         updated_at = NOW()
       WHERE id = ? AND farmer_id = ?`,
      [name, quantity, price, category, description, image_url, id, parseInt(farmerId)]
    );

    if (result.affectedRows === 0) {
      await db.end();
      return NextResponse.json(
        { 
          error: "Product not found or access denied",
          productId: id
        }, 
        { status: 404 }
      );
    }

    // GET UPDATED PRODUCT
    const [updatedProduct]: any = await db.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    await db.end();

    return NextResponse.json(
      { 
        success: true, 
        message: "Product updated successfully",
        product: updatedProduct[0] 
      }, 
      { status: 200 }
    );

  } catch (err: any) {
    console.error("PRODUCT UPDATE ERROR:", err);
    
    if (db) await db.end();
    
    return NextResponse.json(
      { error: "Failed to update product" }, 
      { status: 500 }
    );
  }
}

// DELETE: Delete product
export async function DELETE(request: NextRequest) {
  let db;
  try {
    const farmerId = request.headers.get('x-farmer-id');
    
    if (!farmerId) {
      return NextResponse.json(
        { error: "Authentication required" }, 
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" }, 
        { status: 400 }
      );
    }

    // DB CONNECTION
    db = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "darcho",
    });

    // CHECK AND DELETE PRODUCT
    const [product]: any = await db.execute(
      "SELECT * FROM products WHERE id = ? AND farmer_id = ?",
      [id, parseInt(farmerId)]
    );

    if (product.length === 0) {
      await db.end();
      return NextResponse.json(
        { error: "Product not found or access denied" }, 
        { status: 404 }
      );
    }

    await db.execute(
      "DELETE FROM products WHERE id = ? AND farmer_id = ?",
      [id, parseInt(farmerId)]
    );

    await db.end();

    return NextResponse.json(
      { 
        success: true, 
        message: "Product deleted successfully",
        product: product[0]
      }, 
      { status: 200 }
    );

  } catch (err: any) {
    console.error("PRODUCT DELETE ERROR:", err);
    
    if (db) await db.end();
    
    return NextResponse.json(
      { error: "Failed to delete product" }, 
      { status: 500 }
    );
  }
}