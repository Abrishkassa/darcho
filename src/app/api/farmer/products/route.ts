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

    const [rows]: any = await db.execute(
      "SELECT * FROM products WHERE farmer_id = ?",
      [farmer_id]
    );

    await db.end();

    return NextResponse.json(rows);
  } catch (err) {
    console.log("FARMER PRODUCTS ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
