// app/api/farmer/products/route.ts
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

// IMPORTANT: Configure runtime to be Node.js
export const runtime = 'nodejs'; // Add this line

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "darcho",
  waitForConnections: true,
  connectionLimit: 10,
});

export async function GET(request: Request) {
  console.log("✅ Farmer products API called (Node.js runtime)");
  
  // Get auth header
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Session ")) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Unauthorized",
        message: "No valid session found. Please log in."
      },
      { status: 401 }
    );
  }

  const sessionId = authHeader.split(" ")[1];
  
  // For testing without DB, return mock data
  return NextResponse.json({
    success: true,
    message: "Products API is working!",
    products: [
      {
        id: 1,
        name: "Organic Coffee Beans",
        quantity: 50,
        price: 2500,
        category: "Coffee",
        description: "Premium organic coffee beans",
        unit: "kg",
        status: "available",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        name: "Fresh Milk",
        quantity: 30,
        price: 1200,
        category: "Dairy",
        description: "Fresh milk from grass-fed cows",
        unit: "liter",
        status: "available",
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        name: "Organic Eggs",
        quantity: 100,
        price: 300,
        category: "Poultry",
        description: "Farm fresh organic eggs",
        unit: "piece",
        status: "available",
        created_at: new Date().toISOString()
      }
    ],
    stats: {
      farmer_id: 1,
      product_count: 3,
      total_quantity: 180,
      total_value: 164000
    },
    debug: {
      runtime: "nodejs",
      has_auth: !!authHeader,
      session_length: sessionId?.length || 0,
      timestamp: new Date().toISOString()
    }
  });
}