import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Missing phone or password" }, { status: 400 });
    }

    // Find user
    const [rows]: any = await db.execute("SELECT * FROM users WHERE phone = ?", [phone]);
    const user = rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Success
    return NextResponse.json({ message: "Login successful", user: { id: user.id, full_name: user.full_name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
