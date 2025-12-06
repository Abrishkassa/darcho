// app/api/farmer/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  let db;
  try {
    // Log headers for debugging
    const farmerId = request.headers.get('x-farmer-id') || '1';
    
    console.log('🌾 Fetching products for farmer_id:', farmerId);

    // DB CONNECTION
    db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "darcho",
    });

    // Check if products table exists
    try {
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

      console.log(`✅ Found ${products.length} products for farmer ${farmerId}`);

      await db.end();

      return NextResponse.json(
        { 
          success: true, 
          products: products,
          count: products.length,
          farmerId: farmerId
        }, 
        { status: 200 }
      );

    } catch (tableError: any) {
      // Table might not exist
      if (tableError.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json(
          { 
            success: false, 
            error: "Products table not found in database",
            farmerId: farmerId,
            debug: { errorCode: tableError.code, errorMessage: tableError.message },
            products: [],
            count: 0
          }, 
          { status: 404 }
        );
      }
      throw tableError;
    }

  } catch (err: any) {
    console.error("❌ PRODUCTS FETCH ERROR:", err.message);
    
    if (db) await db.end();
    
    // Provide helpful mock data based on error type
    let errorMessage = "Database error";
    let debugInfo = {};
    
    if (err.code === 'ECONNREFUSED') {
      errorMessage = "MySQL database not running. Start XAMPP/WAMP or MySQL server.";
      debugInfo = { errorCode: err.code, suggestion: "Start MySQL service" };
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      errorMessage = "Database access denied. Check username/password.";
      debugInfo = { errorCode: err.code, user: "root", database: "darcho" };
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      errorMessage = "Database 'darcho' not found. Create it first.";
      debugInfo = { errorCode: err.code, suggestion: "CREATE DATABASE darcho;" };
    }

    // Mock data for development
    const mockProducts = [
      {
        id: 1,
        name: "Ethiopian Coffee Beans",
        quantity: 50,
        price: 1200,
        category: "Coffee",
        description: "High-quality Arabica beans from Sidama region",
        image_url: null,
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
      },
      {
        id: 2,
        name: "Sidama Special Blend",
        quantity: 30,
        price: 1500,
        category: "Coffee",
        description: "Premium blend from Bensa region",
        image_url: null,
        created_at: "2024-01-14T09:15:00Z",
        updated_at: "2024-01-14T09:15:00Z",
      },
    ];

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        debug: { ...debugInfo, fullError: err.message },
        products: mockProducts,
        count: mockProducts.length,
        farmerId: request.headers.get('x-farmer-id') || '1',
        isMockData: true
      }, 
      { status: 500 }
    );
  }
}