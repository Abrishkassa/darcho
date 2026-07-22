import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/profile - Get farmer profile
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized - Farmer access required', profile: null, recent_products: [] },
        { status: 401 }
      );
    }

    const farmerId = session.farmerId;

    const { data: farmer, error: farmerError } = await supabase
      .from('farmers')
      .select('*, users ( email, phone, full_name, is_verified, created_at )')
      .eq('id', farmerId)
      .single();

    if (farmerError || !farmer) {
      return NextResponse.json({ success: false, error: 'Farmer not found' }, { status: 404 });
    }

    const { data: recentProducts } = await supabase
      .from('products')
      .select('id, name, category, price_per_unit, quantity, unit, description, image_urls, created_at')
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false })
      .limit(5);

    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId);

    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .neq('status', 'cart');

    const profile = {
      id: farmer.id,
      fullname: farmer.users?.full_name,
      phone: farmer.users?.phone,
      email: farmer.users?.email,
      region: farmer.region,
      residence: farmer.residence,
      farm_size: farmer.farm_size,
      years_farming: farmer.years_farming,
      farm_name: farmer.farm_name,
      certifications: farmer.certifications || [],
      join_date: farmer.join_date,
      experience: farmer.years_farming ? `${farmer.years_farming} years` : 'Not specified',
      total_products: totalProducts || 0,
      total_orders: totalOrders || 0,
      avg_rating: farmer.avg_rating,
      response_time_hours: farmer.response_time_hours,
      profile_image_url: farmer.profile_image_url,
    };

    const formattedRecentProducts = (recentProducts || []).map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price_per_unit,
      quantity: product.quantity,
      unit: product.unit,
      description: product.description,
      image_url: product.image_urls?.[0] || null,
      created_at: product.created_at,
    }));

    return NextResponse.json({
      success: true,
      profile,
      recent_products: formattedRecentProducts,
      stats: {
        total_products: totalProducts || 0,
        total_orders: totalOrders || 0,
        avg_rating: farmer.avg_rating,
      },
    });
  } catch (error: any) {
    console.error('Error fetching farmer profile:', error);
    return NextResponse.json(
      { success: false, error: error.message, profile: null, recent_products: [] },
      { status: 500 }
    );
  }
}

// PUT /api/farmer/profile - Update farmer profile
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json({ success: false, error: session.error || 'Unauthorized' }, { status: 401 });
    }

    const updateData = await request.json();

    const farmerUpdatePayload: Record<string, any> = {};
    if (updateData.farm_name !== undefined) farmerUpdatePayload.farm_name = updateData.farm_name;
    if (updateData.region !== undefined) farmerUpdatePayload.region = updateData.region;
    if (updateData.residence !== undefined) farmerUpdatePayload.residence = updateData.residence;
    if (updateData.farm_size !== undefined) farmerUpdatePayload.farm_size = updateData.farm_size;
    if (updateData.years_farming !== undefined)
      farmerUpdatePayload.years_farming = updateData.years_farming ? parseInt(updateData.years_farming) : null;
    if (updateData.certifications !== undefined) farmerUpdatePayload.certifications = updateData.certifications;
    if (updateData.profile_image_url !== undefined)
      farmerUpdatePayload.profile_image_url = updateData.profile_image_url;

    if (Object.keys(farmerUpdatePayload).length > 0) {
      const { error: farmerUpdateError } = await supabase
        .from('farmers')
        .update(farmerUpdatePayload)
        .eq('id', session.farmerId);
      if (farmerUpdateError) throw farmerUpdateError;
    }

    if (updateData.fullname || updateData.email || updateData.phone) {
      const userUpdatePayload: Record<string, any> = {};
      if (updateData.fullname !== undefined) userUpdatePayload.full_name = updateData.fullname;
      if (updateData.email !== undefined) userUpdatePayload.email = updateData.email;
      if (updateData.phone !== undefined) userUpdatePayload.phone = updateData.phone;

      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdatePayload)
        .eq('id', session.userId);
      if (userUpdateError) throw userUpdateError;
    }

    const { data: farmer, error: farmerFetchError } = await supabase
      .from('farmers')
      .select('*, users ( email, phone, full_name )')
      .eq('id', session.farmerId)
      .single();

    if (farmerFetchError || !farmer) throw farmerFetchError || new Error('Farmer not found after update');

    const responseProfile = {
      id: farmer.id,
      fullname: farmer.users?.full_name,
      phone: farmer.users?.phone,
      email: farmer.users?.email,
      region: farmer.region,
      residence: farmer.residence,
      farm_size: farmer.farm_size,
      years_farming: farmer.years_farming,
      farm_name: farmer.farm_name,
      certifications: farmer.certifications || [],
      join_date: farmer.join_date,
    };

    return NextResponse.json({ success: true, message: 'Profile updated successfully', profile: responseProfile });
  } catch (error: any) {
    console.error('Error updating farmer profile:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
