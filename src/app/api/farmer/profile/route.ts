import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/profile - Get farmer profile
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);
    
    if (!session.isValid || session.userRole !== 'farmer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }
    
    const farmerId = session.farmerId;
    
    // Get farmer profile with user data
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            fullName: true,
            isVerified: true,
            createdAt: true,
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            category: true,
            pricePerUnit: true,
            quantity: true,
            unit: true,
            description: true,
            imageUrls: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 5, // Get recent products
        },
        _count: {
          select: {
            products: true,
            orders: true,
          }
        }
      }
    });
    
    if (!farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      );
    }
    
    // Format response
    const profile = {
      id: farmer.id,
      fullname: farmer.user.fullName,
      phone: farmer.user.phone,
      email: farmer.user.email,
      region: farmer.region,
      residence: farmer.residence,
      farm_size: farmer.farmSize,
      years_farming: farmer.yearsFarming,
      farm_name: farmer.farmName,
      certifications: farmer.certifications,
      join_date: farmer.joinDate.toISOString(),
      experience: farmer.yearsFarming ? `${farmer.yearsFarming} years` : 'Not specified',
      total_products: farmer._count.products,
      total_orders: farmer._count.orders,
      avg_rating: farmer.avgRating,
      response_time_hours: farmer.responseTimeHours,
      profile_image_url: farmer.profileImageUrl,
    };
    
    // Format recent products
    const recentProducts = farmer.products.map(product => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.pricePerUnit,
      quantity: product.quantity,
      unit: product.unit,
      description: product.description,
      image_url: product.imageUrls[0] || null,
      created_at: product.createdAt.toISOString(),
    }));
    
    return NextResponse.json({
      success: true,
      profile,
      recent_products: recentProducts,
      stats: {
        total_products: farmer._count.products,
        total_orders: farmer._count.orders,
        avg_rating: farmer.avgRating,
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching farmer profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        profile: null,
        recent_products: []
      },
      { status: 500 }
    );
  }
}

// PUT /api/farmer/profile - Update farmer profile
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);
    
    if (!session.isValid || session.userRole !== 'farmer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const farmerId = session.farmerId;
    const updateData = await request.json();
    
    // Update farmer profile
    const updatedFarmer = await prisma.farmer.update({
      where: { id: farmerId },
      data: {
        farmName: updateData.farm_name,
        region: updateData.region,
        residence: updateData.residence,
        farmSize: updateData.farm_size,
        yearsFarming: updateData.years_farming ? parseInt(updateData.years_farming) : undefined,
        certifications: updateData.certifications || [],
        profileImageUrl: updateData.profile_image_url,
      }
    });
    
    // Update user data if provided
    if (updateData.fullname || updateData.email || updateData.phone) {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          fullName: updateData.fullname,
          email: updateData.email,
          phone: updateData.phone,
        }
      });
    }
    
    // Get updated profile
    const farmer = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            fullName: true,
          }
        }
      }
    });
    
    const responseProfile = {
      id: farmer!.id,
      fullname: farmer!.user.fullName,
      phone: farmer!.user.phone,
      email: farmer!.user.email,
      region: farmer!.region,
      residence: farmer!.residence,
      farm_size: farmer!.farmSize,
      years_farming: farmer!.yearsFarming,
      farm_name: farmer!.farmName,
      certifications: farmer!.certifications,
      join_date: farmer!.joinDate.toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: responseProfile,
    });
    
  } catch (error: any) {
    console.error('Error updating farmer profile:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}