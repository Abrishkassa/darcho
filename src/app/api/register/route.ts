import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullname, phone, email, residence, region, password, role } = body; // ⭐ role added

    if (!fullname || !phone || !password || !region || !residence) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // DB CONNECTION
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "darcho",
    });

    // CHECK IF PHONE EXISTS
    const [exists]: any = await db.execute(
      "SELECT id FROM users WHERE phone = ? LIMIT 1",
      [phone]
    );

    if (exists.length > 0) {
      return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    // HASH PASSWORD
    const hash = await bcrypt.hash(password, 10);

    // INSERT USER + ROLE ⭐ updated query
    await db.execute(
      `INSERT INTO users (fullname, phone, email, residence, region, password, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullname, phone, email, residence, region, password, role] // ⭐ role added
    );

    await db.end();

    return NextResponse.json({ message: "Registered successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("REGISTER ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
