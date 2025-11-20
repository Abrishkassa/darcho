import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { fullname, phone, email, region, residence, password } =
      await req.json();

    if (!fullname || !phone || !region || !residence || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check existing phone
    const [existing] = await db.query(
      "SELECT id FROM users WHERE phone = ?",
      [phone]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: "Phone number already registered" },
        { status: 400 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (fullname, phone, email, region, residence, password_hash) VALUES (?, ?, ?, ?, ?, ?)",
      [fullname, phone, email, region, residence, password_hash]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
