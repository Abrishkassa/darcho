import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const region = searchParams.get('region');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const skip = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        farmers (
          id,
          farm_name,
          region,
          avg_rating,
          users (
            full_name,
            phone
          )
        )
      `, { count: 'exact' })
      .eq('status', 'available')
      .range(skip, skip + limit - 1)
      .order('created_at', { ascending: false });

    if (category && category !== 'all') query = query.eq('category', category);
    if (region) query = query.eq('origin_region', region);
    if (minPrice) query = query.gte('price_per_unit', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price_per_unit', parseFloat(maxPrice));
    if (search) query = query.ilike('name', `%${search}%`);

    const { data: products, error, count } = await query;

    if (error) throw error;

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }
    });

  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}