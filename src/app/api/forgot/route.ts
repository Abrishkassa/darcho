import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { phone, newPassword } = await req.json();
    if (!phone || !newPassword) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [rows]: any = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bcrypt = (await import("bcryptjs")).default;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET password_hash = ? WHERE phone = ?", [hashedPassword, phone]);
    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
