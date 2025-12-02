import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { phone, new_password } = await req.json();

    if (!phone || !new_password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(new_password, 10);

    // Update user password
    const [result] = await db.execute("UPDATE users SET password_hash = ? WHERE phone = ?", [password_hash, phone]);

    // Check if user exists
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
