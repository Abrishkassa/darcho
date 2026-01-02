import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        farmer: true,
        buyer: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Create session
    const sessionId = randomBytes(32).toString('hex');
    const authHeader = `Session ${sessionId}`;
    
    // Return user data
    const responseData = {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        isVerified: user.isVerified,
      },
      session: {
        session_id: sessionId,
        auth_header: authHeader,
      },
    };
    
    // Add farmer/buyer specific data
    if (user.role === 'farmer' && user.farmer) {
      (responseData.user as any).farmer_id = user.farmer.id;
      (responseData.user as any).farm_name = user.farmer.farmName;
    }
    
    if (user.role === 'buyer' && user.buyer) {
      (responseData.user as any).buyer_id = user.buyer.id;
      (responseData.user as any).company_name = user.buyer.companyName;
    }
    
    const response = NextResponse.json(responseData);
    
    // Set cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });
    
    return response;
    
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}