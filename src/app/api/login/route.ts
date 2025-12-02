import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json({ error: "Missing phone or password" }, { status: 400 });
    }

    // DB CONNECTION
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "darcho",
    });

    // FIND USER BY PHONE
    const [rows]: any = await db.execute(
      "SELECT id, fullname, password, role FROM users WHERE phone = ? LIMIT 1",
      [phone]
    );

    await db.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];
    const match = password === user.password; 
    if (!match) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // SUCCESS → return role so frontend can redirect
    return NextResponse.json(
      {
        message: "Login successful",
        role: user.role,
        fullname: user.fullname,
        id: user.id,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
