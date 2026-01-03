import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/buyer/orders - List buyer's orders
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyer: true }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const where: any = {
      buyerId: user.buyer.id,
      status: { not: 'cart' }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          product: {
            include: {
              farmer: {
                include: {
                  user: { select: { fullName: true, phone: true } }
                }
              }
            }
          },
          review: true
        },
        orderBy: { orderDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where })
    ]);

    // Calculate statistics
    const stats = {
      total: await prisma.order.count({ 
        where: { buyerId: user.buyer.id, status: { not: 'cart' } }
      }),
      delivered: await prisma.order.count({ 
        where: { buyerId: user.buyer.id, status: 'delivered' }
      }),
      processing: await prisma.order.count({ 
        where: { buyerId: user.buyer.id, status: 'processing' }
      }),
      shipped: await prisma.order.count({ 
        where: { buyerId: user.buyer.id, status: 'shipped' }
      }),
      totalSpent: await prisma.order.aggregate({
        where: { buyerId: user.buyer.id, status: { not: 'cart' } },
        _sum: { totalPrice: true }
      })
    };

    return NextResponse.json({
      success: true,
      data: orders,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/orders - Checkout cart items
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { shippingAddress, paymentMethod, notes } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        buyer: {
          include: {
            orders: {
              where: { status: 'cart' },
              include: { product: true }
            }
          }
        }
      }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const cartItems = user.buyer.orders;
    if (cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Check stock availability
    //for (const item of cartItems) {
      //if (item.product.quantity < item.quantity) {
        //return NextResponse.json(
         // { error: `Insufficient stock for ${item.product.name}` },
        //  { status: 400 }
      //  );
   //   }
   // }

    // Update stock and create real orders
    const updatedOrders = [];
    for (const item of cartItems) {
      // Update product stock
      await prisma.product.update({
        where: { id: item.productId! },
        data: { quantity: { decrement: item.quantity } }
      });

      // Update order status
      const updatedOrder = await prisma.order.update({
        where: { id: item.id },
        data: {
          status: 'pending',
          shippingAddress,
          paymentMethod,
          notes,
          orderDate: new Date()
        },
        include: {
          product: {
            include: {
              farmer: {
                include: {
                  user: { select: { fullName: true } }
                }
              }
            }
          }
        }
      });

      updatedOrders.push(updatedOrder);
    }

    return NextResponse.json({
      success: true,
      message: 'Order placed successfully',
      data: updatedOrders
    });
  } catch (error) {
    console.error('Error placing order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}