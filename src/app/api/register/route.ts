import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { fullname, phone, email, residence_area, region, password } = await req.json();

    const hashed = await bcrypt.hash(password, 10);

    const [result]: any = await db.execute(
      `INSERT INTO users (fullname, phone, email, residence_area, region, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullname, phone, email || null, residence_area, region, hashed]
    );

    return NextResponse.json({ success: true, userId: result.insertId });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Registration error" }, { status: 500 });
  }
}
