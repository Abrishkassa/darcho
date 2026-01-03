import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/buyer/cart - Get buyer's cart items
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        buyer: {
          include: {
            orders: {
              where: { status: 'cart' },
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
            }
          }
        }
      }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user.buyer.orders,
      totalItems: user.buyer.orders.length,
      totalPrice: user.buyer.orders.reduce((sum, order) => sum + order.totalPrice, 0)
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Product ID and quantity are required' },
        { status: 400 }
      );
    }

    // Get buyer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyer: true }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { farmer: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.quantity < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock available' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create cart order
    const cartItem = await prisma.order.create({
      data: {
        orderNumber,
        productId,
        buyerId: user.buyer.id,
        farmerId: product.farmerId,
        quantity,
        unitPrice: product.pricePerUnit,
        totalPrice: product.pricePerUnit * quantity,
        status: 'cart',
        deliveryStatus: 'pending',
        paymentStatus: 'pending'
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

    return NextResponse.json({
      success: true,
      message: 'Item added to cart',
      data: cartItem
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/buyer/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyer: true }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    await prisma.order.deleteMany({
      where: {
        buyerId: user.buyer.id,
        status: 'cart'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cart' },
      { status: 500 }
    );
  }
}