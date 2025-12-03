import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const farmer_id = url.searchParams.get("farmer_id");

    if (!farmer_id) {
      return NextResponse.json(
        { error: "Missing farmer_id" },
        { status: 400 }
      );
    }

    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "darcho",
    });

    // total products
    const [products]: any = await db.execute(
      "SELECT COUNT(*) AS total_products FROM products WHERE farmer_id = ?",
      [farmer_id]
    );

    // total orders
    const [orders]: any = await db.execute(
      `SELECT COUNT(*) AS total_orders
       FROM orders 
       JOIN products ON orders.product_id = products.id 
       WHERE products.farmer_id = ?`,
      [farmer_id]
    );

    await db.end();

    return NextResponse.json({
      total_products: products[0].total_products,
      total_orders: orders[0].total_orders,
    });
  } catch (err) {
    console.log("INSIGHTS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
