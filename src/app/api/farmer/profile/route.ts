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
      "SELECT fullname, phone, region, residence FROM users WHERE id = ?",
      [farmer_id]
    );

    await db.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: "Farmer not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (err) {
    console.log("FARMER PROFILE ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
