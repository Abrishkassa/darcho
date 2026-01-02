import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

// GET /api/farmer/products - Get farmer's products
export async function GET(request: NextRequest) {
  try {
    // Extract farmer ID from session (we'll implement auth later)
    // For now, get farmer ID from query params or first farmer in DB
    const searchParams = request.nextUrl.searchParams;
    const farmerId = searchParams.get('farmerId');
    
    let farmer;
    
    if (farmerId) {
      farmer = await prisma.farmer.findUnique({
        where: { id: parseInt(farmerId) },
        include: { products: true },
      });
    } else {
      // Get first farmer for testing
      farmer = await prisma.farmer.findFirst({
        include: { 
          products: {
            orderBy: { createdAt: 'desc' }
          } 
        },
      });
    }
    
    if (!farmer) {
      return NextResponse.json(
        { success: false, error: 'Farmer not found' },
        { status: 404 }
      );
    }
    
    // Calculate stats
    const totalQuantity = farmer.products.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = farmer.products.reduce(
      (sum, product) => sum + (product.quantity * product.pricePerUnit), 
      0
    );
    
    return NextResponse.json({
      success: true,
      products: farmer.products,
      stats: {
        total_quantity: totalQuantity,
        product_count: farmer.products.length,
        farmer_id: farmer.id,
        total_value: totalValue,
      },
    });
    
  } catch (error: any) {
    console.error('Error fetching farmer products:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined 
      },
      { status: 500 }
    );
  }
}

// POST /api/farmer/products - Add new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['farmerId', 'name', 'grade', 'category', 'quantity', 'pricePerUnit', 'originRegion'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        farmerId: parseInt(body.farmerId),
        name: body.name,
        grade: body.grade,
        category: body.category,
        quantity: parseFloat(body.quantity),
        unit: body.unit || 'kg',
        pricePerUnit: parseFloat(body.pricePerUnit),
        description: body.description,
        originRegion: body.originRegion,
        altitude: body.altitude,
        harvestDate: body.harvestDate ? new Date(body.harvestDate) : null,
        processingMethod: body.processingMethod,
        certifications: body.certifications || [],
        moistureContent: body.moistureContent ? parseFloat(body.moistureContent) : null,
        beanSize: body.beanSize,
        cuppingScore: body.cuppingScore ? parseFloat(body.cuppingScore) : null,
        imageUrls: body.imageUrls || [],
        status: 'available',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}