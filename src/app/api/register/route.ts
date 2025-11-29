import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { fullName, phone, email, residence, region, password, role } = await req.json();

    // Basic validation
    if (!fullName || !phone || !residence || !region || !password || !role) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if user exists
    const [existing]: any = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    await db.query(
      "INSERT INTO users (full_name, phone, email, residence, region, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [fullName, phone, email || null, residence, region, hashedPassword, role]
    );

    return NextResponse.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
