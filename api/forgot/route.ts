import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { phone } = await req.json();

  const [rows] = await db.query(
    "SELECT id FROM users WHERE phone = ?",
    [phone]
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json(
      { error: "Phone not found" },
      { status: 400 }
    );
  }
  return NextResponse.json({
    success: true,
    message: "Password reset procedure will be implemented next.",
  });
}
