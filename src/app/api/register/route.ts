import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { full_name, phone, email, residence_area, region, password } = await req.json();

    if (!full_name || !phone || !residence_area || !region || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into database
    await db.execute(
      "INSERT INTO users (full_name, phone, email, residence_area, region, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [full_name, phone, email || null, residence_area, region, password_hash]
    );

    return NextResponse.json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
