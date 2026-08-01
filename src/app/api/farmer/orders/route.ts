import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyFarmerSession } from '@/app/lib/auth';
import { createNotification } from '@/app/lib/notifications';

export const runtime = 'nodejs';

// GET /api/farmer/orders - Get farmer's orders
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        {
          success: false,
          error: session.error || 'Unauthorized - Farmer access required',
          orders: [],
          stats: { total_orders: 0, confirmed_orders: 0, total_quantity: 0 },
        },
        { status: 401 }
      );
    }

    const farmerId = session.farmerId;

    const { data: orders, error } = await supabase
      .from('orders')
      .select(
        `*,
        products ( name, grade, category ),
        buyers ( company_name, users ( full_name, phone, email ) )`
      )
      .eq('farmer_id', farmerId)
      .neq('status', 'cart')
      .order('order_date', { ascending: false });

    if (error) throw error;

    const formattedOrders = (orders || []).map((order: any) => ({
      id: order.id,
      order_number: order.order_number,
      buyer: order.buyers?.users?.full_name || order.buyers?.company_name || 'Unknown Buyer',
      product: order.products?.name || 'Unknown Product',
      quantity: order.quantity,
      total: order.total_price,
      status: order.status,
      delivery: order.delivery_status,
      date: order.order_date ? new Date(order.order_date).toISOString().split('T')[0] : null,
      payment_status: order.payment_status,
      notes: order.notes,
    }));

    const totalOrders = formattedOrders.length;
    const totalQuantity = formattedOrders.reduce((sum, o) => sum + (o.quantity || 0), 0);
    const confirmedOrders = formattedOrders.filter((o) =>
      ['confirmed', 'processing', 'shipped', 'delivered'].includes(o.status)
    ).length;

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      stats: {
        total_orders: totalOrders,
        confirmed_orders: confirmedOrders,
        total_quantity: totalQuantity,
      },
    });
  } catch (error: any) {
    console.error('Error fetching farmer orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        orders: [],
        stats: { total_orders: 0, confirmed_orders: 0, total_quantity: 0 },
      },
      { status: 500 }
    );
  }
}

// PUT /api/farmer/orders - Update order status (order belongs to the logged-in farmer)
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: session.error || 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orderId, status, deliveryStatus } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: 'Order ID and status are required' },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      status,
      delivery_status: deliveryStatus || status,
    };
    if (status === 'confirmed') updatePayload.confirmed_date = new Date().toISOString();
    if (status === 'shipped') updatePayload.shipped_date = new Date().toISOString();
    if (status === 'delivered') updatePayload.delivered_date = new Date().toISOString();

    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .eq('farmer_id', session.farmerId)
      .select()
      .single();

    if (error) throw error;

    if (!updatedOrder) {
      return NextResponse.json({ success: false, error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Notify the buyer of the status change
    const { data: buyerRow } = await supabase
      .from('buyers')
      .select('user_id')
      .eq('id', updatedOrder.buyer_id)
      .single();

    if (buyerRow?.user_id) {
      await createNotification({
        userId: buyerRow.user_id,
        type: 'order_status_change',
        title: 'Order status updated',
        message: `Order ${updatedOrder.order_number} is now ${status}`,
        relatedOrderId: updatedOrder.id,
      });
    }

    return NextResponse.json({ success: true, message: 'Order updated successfully', order: updatedOrder });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
