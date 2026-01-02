import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export async function GET() {
  try {
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT NOW() as time, version() as version`;
    
    return NextResponse.json({
      success: true,
      message: '✅ PostgreSQL + Prisma connected successfully!',
      database: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to connect to database. Check: 1) PostgreSQL is running, 2) DATABASE_URL in .env is correct',
      help: 'Run: sudo systemctl start postgresql (Linux) or start PostgreSQL service (Windows)',
    }, { status: 500 });
  }
}