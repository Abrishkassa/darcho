import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/buyer/dashboard - Get dashboard stats
export async function GET(request: NextRequest) {
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

    const [
      totalOrders,
      cartItems,
      favorites,
      activeChats,
      recentOrders,
      totalSpent,
      monthlyData,
      topFarmers,
      recommendedProducts
    ] = await Promise.all([
      // Total orders (excluding cart)
      prisma.order.count({
        where: {
          buyerId: user.buyer.id,
          status: { not: 'cart' }
        }
      }),

      // Cart items count
      prisma.order.count({
        where: {
          buyerId: user.buyer.id,
          status: 'cart'
        }
      }),

      // Favorites count
      prisma.order.count({
        where: {
          buyerId: user.buyer.id,
          status: 'favorite'
        }
      }),

      // Active chats (unread messages)
      prisma.message.count({
        where: {
          receiverId: user.id,
          isRead: false
        }
      }),

      // Recent orders (last 5)
      prisma.order.findMany({
        where: {
          buyerId: user.buyer.id,
          status: { not: 'cart' }
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
        },
        orderBy: { orderDate: 'desc' },
        take: 5
      }),

      // Total spent
      prisma.order.aggregate({
        where: {
          buyerId: user.buyer.id,
          status: { not: 'cart' }
        },
        _sum: { totalPrice: true }
      }),

      // Monthly spending (last 6 months)
      getMonthlySpending(user.buyer.id),

      // Top 3 farmers by orders
      getTopFarmers(user.buyer.id),

      // Recommended products (based on past orders)
      getRecommendedProducts(user.buyer.id)
    ]);

    const stats = {
      totalOrders,
      cartItems,
      favorites,
      activeChats,
      totalSpent: totalSpent._sum.totalPrice || 0
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrders,
        monthlyData,
        topFarmers,
        recommendedProducts,
        buyerProfile: user.buyer
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getMonthlySpending(buyerId: number) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await prisma.order.groupBy({
    by: ['orderDate'],
    where: {
      buyerId,
      status: { not: 'cart' },
      orderDate: { gte: sixMonthsAgo }
    },
    _sum: { totalPrice: true },
    _count: true
  });

  return monthlyData.map(item => ({
    month: item.orderDate.toLocaleString('default', { month: 'short' }),
    total: item._sum.totalPrice,
    orders: item._count
  }));
}

async function getTopFarmers(buyerId: number) {
  const topFarmers = await prisma.order.groupBy({
    by: ['farmerId'],
    where: {
      buyerId,
      status: { not: 'cart' }
    },
    _count: true,
    _sum: { totalPrice: true },
    orderBy: { _count: { id: 'desc' } },
    take: 3
  });

  return Promise.all(
    topFarmers.map(async farmer => {
      const farmerData = await prisma.farmer.findUnique({
        where: { id: farmer.farmerId },
        include: {
          user: { select: { fullName: true } }
        }
      });
      return {
        ...farmerData,
        orderCount: farmer._count,
        totalSpent: farmer._sum.totalPrice
      };
    })
  );
}

async function getRecommendedProducts(buyerId: number) {
  // Get buyer's ordered product categories
  const pastOrders = await prisma.order.findMany({
    where: {
      buyerId,
      status: { not: 'cart' },
      productId: { not: null }
    },
    include: { product: true },
    distinct: ['productId']
  });

  const categories = [...new Set(pastOrders.map(order => order.product?.category))];

  // Recommend products from same categories
  return prisma.product.findMany({
    where: {
      category: { 
  in: categories.filter((category): category is string => category !== undefined) 
},
      status: 'available',
      quantity: { gt: 0 }
    },
    include: {
      farmer: {
        include: {
          user: { select: { fullName: true } }
        }
      }
    },
    orderBy: { cuppingScore: 'desc' },
    take: 6
  });
}