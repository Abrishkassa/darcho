import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { data: user } = await supabase
      .from('users')
      .select('*, buyers(*)')
      .eq('email', session.user.email)
      .single();

    if (!user?.buyers) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    let query = supabase
      .from('orders')
      .select(`*, products(name, grade, farmers(farm_name, users(full_name, phone)))`, { count: 'exact' })
      .eq('buyer_id', user.buyers.id)
      .neq('status', 'cart')
      .order('order_date', { ascending: false })
      .range(skip, skip + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: orders, count, error } = await query;
    if (error) throw error;

    const { data: spentData } = await supabase
      .from('orders')
      .select('total_price')
      .eq('buyer_id', user.buyers.id)
      .neq('status', 'cart');

    const totalSpent = spentData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    return NextResponse.json({
      success: true,
      data: orders || [],
      stats: { totalSpent },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, farmerId, quantity, unitPrice, totalPrice, shippingAddress, deliveryDate, paymentMethod, notes } = body;

    const { data: user } = await supabase
      .from('users')
      .select('*, buyers(*)')
      .eq('email', session.user.email)
      .single();

    if (!user?.buyers) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        product_id: productId,
        buyer_id: user.buyers.id,
        farmer_id: farmerId,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
        status: 'pending',
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        payment_status: 'pending',
        notes,
        order_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update product quantity
    await supabase.rpc('decrement_quantity', { 
      product_id: productId, 
      amount: quantity 
    }).single();

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}