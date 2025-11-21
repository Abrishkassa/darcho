import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    const [rows]: any = await db.execute(
      "SELECT id, password_hash FROM users WHERE phone = ? LIMIT 1",
      [phone]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
    }

    const user = rows[0] as { id: number; password_hash: string };

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return NextResponse.json({ error: "Invalid phone or password" }, { status: 401 });
    }

    return NextResponse.json({ success: true, userId: user.id });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
