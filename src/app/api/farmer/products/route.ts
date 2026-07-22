import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/products - Get all products for the logged-in farmer
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        {
          success: false,
          error: session.error || 'Unauthorized - Farmer access required',
          products: [],
          stats: { total_quantity: 0, product_count: 0, farmer_id: null, total_value: 0 },
        },
        { status: 401 }
      );
    }

    const farmerId = session.farmerId;

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedProducts = (products || []).map((product) => ({
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price_per_unit,
      category: product.category,
      description: product.description,
      image_url: product.image_urls?.[0] || null,
      created_at: product.created_at,
      updated_at: product.updated_at,
      grade: product.grade,
      origin: product.origin_region,
      altitude: product.altitude,
      unit: product.unit,
      status: product.status,
      certifications: product.certifications,
      harvest_date: product.harvest_date,
      processing_method: product.processing_method,
    }));

    const totalQuantity = formattedProducts.reduce((sum, p) => sum + (p.quantity || 0), 0);
    const totalValue = formattedProducts.reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0);

    return NextResponse.json({
      success: true,
      products: formattedProducts,
      stats: {
        total_quantity: totalQuantity,
        product_count: formattedProducts.length,
        farmer_id: farmerId,
        total_value: totalValue,
      },
    });
  } catch (error: any) {
    console.error('❌ Error fetching farmer products:', error);
    return NextResponse.json(
      {
        success: false,
        error: process.env.NODE_ENV === 'development' ? error.message : 'Failed to fetch products',
        products: [],
        stats: { total_quantity: 0, product_count: 0, farmer_id: null, total_value: 0 },
      },
      { status: 500 }
    );
  }
}

// POST /api/farmer/products - Add a new product
export async function POST(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const requiredFields = ['name', 'category', 'quantity', 'price'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        farmer_id: session.farmerId,
        name: body.name,
        grade: body.grade || 'A',
        category: body.category,
        quantity: parseFloat(body.quantity),
        unit: body.unit || 'kg',
        price_per_unit: parseFloat(body.price),
        description: body.description,
        origin_region: body.origin || body.originRegion || 'Ethiopia',
        altitude: body.altitude,
        harvest_date: body.harvest_date || null,
        processing_method: body.processing_method,
        certifications: body.certifications || [],
        moisture_content: body.moisture_content ? parseFloat(body.moisture_content) : null,
        bean_size: body.bean_size,
        cupping_score: body.cupping_score ? parseFloat(body.cupping_score) : null,
        image_urls: body.image_url ? [body.image_url] : [],
        status: body.status || 'available',
      })
      .select()
      .single();

    if (error) throw error;

    const formattedProduct = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price_per_unit,
      category: product.category,
      description: product.description,
      image_url: product.image_urls?.[0] || null,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return NextResponse.json(
      { success: true, message: 'Product created successfully', product: formattedProduct },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/farmer/products?id=X - Update an existing product (must belong to the logged-in farmer)
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product id is required' }, { status: 400 });
    }

    const body = await request.json();

    const updatePayload: Record<string, any> = {};
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.category !== undefined) updatePayload.category = body.category;
    if (body.price !== undefined) updatePayload.price_per_unit = parseFloat(body.price);
    if (body.quantity !== undefined) updatePayload.quantity = parseFloat(body.quantity);
    if (body.unit !== undefined) updatePayload.unit = body.unit;
    if (body.description !== undefined) updatePayload.description = body.description;
    if (body.status !== undefined) updatePayload.status = body.status;
    if (body.grade !== undefined) updatePayload.grade = body.grade;
    if (body.origin !== undefined) updatePayload.origin_region = body.origin;

    const { data: product, error } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', id)
      .eq('farmer_id', session.farmerId)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found or unauthorized' }, { status: 404 });
    }

    const formattedProduct = {
      id: product.id,
      name: product.name,
      quantity: product.quantity,
      price: product.price_per_unit,
      category: product.category,
      description: product.description,
      image_url: product.image_urls?.[0] || null,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return NextResponse.json({ success: true, message: 'Product updated successfully', product: formattedProduct });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE /api/farmer/products?id=X - Delete a product (must belong to the logged-in farmer)
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('farmer_id', session.farmerId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
