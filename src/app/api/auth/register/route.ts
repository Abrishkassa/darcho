import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import bcrypt from 'bcrypt';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'phone', 'password', 'fullName', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { phone: body.phone }
        ]
      }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email or phone already exists' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email: body.email,
        phone: body.phone,
        passwordHash: hashedPassword,
        role: body.role,
        fullName: body.fullName,
        isVerified: false, // Email verification can be added later
      },
    });
    
    // Create role-specific profile
    if (body.role === 'farmer') {
      await prisma.farmer.create({
        data: {
          userId: user.id,
          farmName: body.farmName || '',
          region: body.region || '',
          residence: body.residence || '',
          certifications: [],
        },
      });
    } else if (body.role === 'buyer') {
      await prisma.buyer.create({
        data: {
          userId: user.id,
          companyName: body.companyName || '',
          businessType: body.businessType || '',
          location: '',
          preferredRegions: [],
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      userId: user.id,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}