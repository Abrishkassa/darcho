import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/orders - Get farmer's orders
export async function GET(request: NextRequest) {
  try {
    // Verify session
    const session = await verifyFarmerSession(request);
    
    if (!session.isValid || session.userRole !== 'farmer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Farmer access required' },
        { status: 401 }
      );
    }
    
    const farmerId = session.farmerId;
    
    // Get orders for this farmer
    const orders = await prisma.order.findMany({
      where: { farmerId },
      include: {
        product: {
          select: {
            name: true,
            grade: true,
            category: true,
          }
        },
        buyer: {
          include: {
            user: {
              select: {
                fullName: true,
                phone: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { orderDate: 'desc' },
    });
    
    // Format orders for frontend
    const formattedOrders = orders.map(order => ({
      id: order.id,
      order_number: order.orderNumber,
      buyer: order.buyer.user.fullName || order.buyer.companyName || 'Unknown Buyer',
      product: order.product?.name || 'Unknown Product',
      quantity: order.quantity,
      total: order.totalPrice,
      status: order.status,
      delivery: order.deliveryStatus,
      date: order.orderDate.toISOString().split('T')[0],
      payment_status: order.paymentStatus,
      notes: order.notes,
    }));
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
    const confirmedOrders = orders.filter(order => 
      order.status === 'confirmed' || 
      order.status === 'processing' || 
      order.status === 'shipped' || 
      order.status === 'delivered'
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
        stats: {
          total_orders: 0,
          confirmed_orders: 0,
          total_quantity: 0,
        }
      },
      { status: 500 }
    );
  }
}

// PUT /api/farmer/orders/:id/status - Update order status
export async function PUT(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);
    
    if (!session.isValid || session.userRole !== 'farmer') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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
    
    // Verify the order belongs to this farmer
    const order = await prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        farmerId: session.farmerId,
      },
    });
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found or unauthorized' },
        { status: 404 }
      );
    }
    
    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        status,
        deliveryStatus: deliveryStatus || status,
        ...(status === 'confirmed' && { confirmedDate: new Date() }),
        ...(status === 'shipped' && { shippedDate: new Date() }),
        ...(status === 'delivered' && { deliveredDate: new Date() }),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder,
    });
    
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}