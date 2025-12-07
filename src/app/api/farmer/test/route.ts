// app/api/farmer/test/route.ts
import { NextResponse } from "next/server";

// Specify Node.js runtime
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Farmer test API is working with Node.js runtime!",
    runtime: "nodejs",
    timestamp: new Date().toISOString()
  });
}