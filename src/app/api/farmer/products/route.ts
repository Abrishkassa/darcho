import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('📡 Fetching farmer products...');
    
    // Get farmer ID from query params or use first farmer
    const searchParams = request.nextUrl.searchParams;
    const farmerId = searchParams.get('farmerId');
    
    let farmer;
    
    if (farmerId) {
      farmer = await prisma.farmer.findUnique({
        where: { id: parseInt(farmerId) },
        include: { 
          products: {
            orderBy: { createdAt: 'desc' }
          } 
        },
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
        { 
          success: false, 
          error: 'No farmer found',
          products: [],
          stats: {
            total_quantity: 0,
            product_count: 0,
            farmer_id: null,
            total_value: 0,
          }
        },
        { status: 200 }
      );
    }
    
    // Format products to match frontend expectations
    const formattedProducts = farmer.products.map(product => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.pricePerUnit, // Convert pricePerUnit → price
      category: product.category,
      description: product.description,
      image_url: product.imageUrls[0] || null, // Convert imageUrls[0] → image_url
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
      // Additional fields your frontend might use
      grade: product.grade,
      origin: product.originRegion,
      altitude: product.altitude,
      unit: product.unit,
      status: product.status,
      certifications: product.certifications,
      harvest_date: product.harvestDate?.toISOString(),
      processing_method: product.processingMethod,
    }));
    
    // Calculate stats
    const totalQuantity = formattedProducts.reduce((sum, product) => sum + product.quantity, 0);
    const totalValue = formattedProducts.reduce(
      (sum, product) => sum + (product.quantity * product.price), 
      0
    );
    
    return NextResponse.json({
      success: true,
      products: formattedProducts,
      stats: {
        total_quantity: totalQuantity,
        product_count: formattedProducts.length,
        farmer_id: farmer.id,
        total_value: totalValue,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Error fetching farmer products:', error);
    
    return NextResponse.json({
      success: false,
      error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch products',
      products: [],
      stats: {
        total_quantity: 0,
        product_count: 0,
        farmer_id: null,
        total_value: 0,
      },
    }, { status: 500 });
  }
}

// POST endpoint for adding products
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation
    const requiredFields = ['farmerId', 'name', 'category', 'quantity', 'price'];
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
        grade: body.grade || 'A',
        category: body.category,
        quantity: parseFloat(body.quantity),
        unit: body.unit || 'kg',
        pricePerUnit: parseFloat(body.price),
        description: body.description,
        originRegion: body.origin || body.originRegion || 'Ethiopia',
        altitude: body.altitude,
        harvestDate: body.harvest_date ? new Date(body.harvest_date) : null,
        processingMethod: body.processing_method,
        certifications: body.certifications || [],
        moistureContent: body.moisture_content ? parseFloat(body.moisture_content) : null,
        beanSize: body.bean_size,
        cuppingScore: body.cupping_score ? parseFloat(body.cupping_score) : null,
        imageUrls: body.image_url ? [body.image_url] : [],
        status: body.status || 'available',
      },
    });
    
    // Format response to match frontend
    const formattedProduct = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.pricePerUnit,
      category: product.category,
      description: product.description,
      image_url: product.imageUrls[0] || null,
      created_at: product.createdAt.toISOString(),
      updated_at: product.updatedAt.toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product: formattedProduct,
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}