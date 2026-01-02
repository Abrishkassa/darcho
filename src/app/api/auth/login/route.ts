import { NextRequest, NextResponse } from "next/server";
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, password } = body; // Accept both email and phone

    if (!password || (!email && !phone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Email/phone and password are required" 
        },
        { status: 400 }
      );
    }

    let user;
    
    // Find user by email OR phone
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          farmer: true,
          buyer: true,
        },
      });
    } else if (phone) {
      // Clean phone number for search
      const cleanPhone = phone.replace(/\D/g, '');
      
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: cleanPhone },
            { phone: { contains: cleanPhone } },
            { phone: { contains: phone } }
          ]
        },
        include: {
          farmer: true,
          buyer: true,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email/phone or password" 
        },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!passwordValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email/phone or password" 
        },
        { status: 401 }
      );
    }

    // Generate session
    const sessionId = randomBytes(32).toString('hex');
    const authHeader = `Session ${sessionId}`;

    // Prepare response data
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
        id: sessionId, // Keep 'id' for backward compatibility
        session_id: sessionId, // Add new format
        auth_header: authHeader,
      },
    };

    // Add farmer/buyer specific data
    if (user.role === 'farmer' && user.farmer) {
      (responseData.user as any).farmer = {
        id: user.farmer.id,
        farmName: user.farmer.farmName,
        region: user.farmer.region,
      };
      (responseData.user as any).farmer_id = user.farmer.id;
    }

    if (user.role === 'buyer' && user.buyer) {
      (responseData.user as any).buyer = {
        id: user.buyer.id,
        companyName: user.buyer.companyName,
      };
      (responseData.user as any).buyer_id = user.buyer.id;
    }

    const response = NextResponse.json(responseData);

    // Set session cookie
    response.cookies.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return response;

  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}