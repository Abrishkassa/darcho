import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';
import { createNotification } from '@/app/lib/notifications';

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
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const { data: buyer } = await supabase
      .from('buyers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    let query = supabase
      .from('orders')
      .select(`*, products(name, grade, farmers(farm_name, users(full_name, phone)))`, { count: 'exact' })
      .eq('buyer_id', buyer.id)
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
      .eq('buyer_id', buyer.id)
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
    // NOTE: the client may send `deliveryDate`, but it is intentionally not read
    // or persisted — the orders table has no delivery_date column (only the
    // lifecycle timestamps confirmed_date/shipped_date/delivered_date).
    const { productId, farmerId, quantity, unitPrice, totalPrice, shippingAddress, paymentMethod, notes } = body;

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (!user) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const { data: buyer } = await supabase
      .from('buyers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Reject orders that exceed the stock the farmer still has available, so a
    // buyer can never take more than what is listed.
    const { data: stockRow, error: stockReadError } = await supabase
      .from('products')
      .select('quantity')
      .eq('id', productId)
      .single();

    if (stockReadError) throw stockReadError;

    const available = stockRow?.quantity ?? 0;

    if (quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'Order quantity must be greater than zero' },
        { status: 400 }
      );
    }

    if (available < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Only ${available} kg of this product is available. Please reduce your order quantity.`,
        },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        product_id: productId,
        buyer_id: buyer.id,
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

    // Decrement the product's remaining stock so the next buyer sees the
    // reduced amount. There is no `decrement_quantity` RPC in this database,
    // so we write back the reduced value using the quantity read above.
    const remaining = available - quantity;

    const { error: stockError } = await supabase
      .from('products')
      .update({
        quantity: remaining > 0 ? remaining : 0,
        // Mark the listing sold out once nothing is left, so it stops
        // appearing as orderable to other buyers.
        ...(remaining > 0 ? {} : { status: 'sold_out' }),
      })
      .eq('id', productId);

    if (stockError) throw stockError;

    // Notify the farmer of the new order
    const { data: farmerRow } = await supabase
      .from('farmers')
      .select('user_id')
      .eq('id', farmerId)
      .single();

    if (farmerRow?.user_id) {
      await createNotification({
        userId: farmerRow.user_id,
        type: 'new_order',
        title: 'New order received',
        message: `Order ${orderNumber} — ${quantity} units`,
        relatedOrderId: order.id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });

  } catch (error) {
    console.error('Error placing order:', error);
    // Surface the message for intentionally-thrown Errors, but never leak
    // unexpected internals (e.g. database errors) to the client.
    const message = error instanceof Error ? error.message : 'Failed to place order';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}