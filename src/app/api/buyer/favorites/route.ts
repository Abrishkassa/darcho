import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/buyer/favorites - Get favorite products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        buyer: {
          include: {
            orders: {
              where: { status: 'favorite' },
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
              },
              skip,
              take: limit,
            }
          }
        }
      }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const total = await prisma.order.count({
      where: {
        buyerId: user.buyer.id,
        status: 'favorite'
      }
    });

    return NextResponse.json({
      success: true,
      data: user.buyer.orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/buyer/favorites/:productId - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { buyer: true }
    });

    if (!user?.buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: { farmer: true }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.order.findFirst({
      where: {
        buyerId: user.buyer.id,
        productId: product.id,
        status: 'favorite'
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Product already in favorites' },
        { status: 400 }
      );
    }

    const favorite = await prisma.order.create({
      data: {
        orderNumber: `FAV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        buyerId: user.buyer.id,
        farmerId: product.farmerId,
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        status: 'favorite',
        deliveryStatus: 'none',
        paymentStatus: 'none'
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
      message: 'Added to favorites',
      data: favorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}