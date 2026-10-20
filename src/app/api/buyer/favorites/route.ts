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
