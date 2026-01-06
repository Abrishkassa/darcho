// app/api/farmer/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// GET /api/farmer/dashboard - Get farmer dashboard stats
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { farmer: true }
    });

    if (!user?.farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    const [
      totalProducts,
      totalOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      monthlyOrders,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      // Total products
      prisma.product.count({
        where: { farmerId: user.farmer.id }
      }),

      // Total orders (excluding cart)
      prisma.order.count({
        where: {
          farmerId: user.farmer.id,
          status: { not: 'cart' }
        }
      }),

      // Active orders (pending + processing)
      prisma.order.count({
        where: {
          farmerId: user.farmer.id,
          status: { in: ['pending', 'confirmed', 'processing'] }
        }
      }),

      // Pending orders (awaiting confirmation)
      prisma.order.count({
        where: {
          farmerId: user.farmer.id,
          status: 'pending'
        }
      }),

      // Completed orders
      prisma.order.count({
        where: {
          farmerId: user.farmer.id,
          status: 'delivered'
        }
      }),

      // Total revenue (from completed orders)
      prisma.order.aggregate({
        where: {
          farmerId: user.farmer.id,
          status: 'delivered'
        },
        _sum: { totalPrice: true }
      }),

      // Monthly revenue (last 30 days)
      prisma.order.aggregate({
        where: {
          farmerId: user.farmer.id,
          status: 'delivered',
          orderDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        _sum: { totalPrice: true }
      }),

      // Monthly orders (last 30 days)
      prisma.order.count({
        where: {
          farmerId: user.farmer.id,
          status: { not: 'cart' },
          orderDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        }
      }),

      // Recent orders (last 10)
      prisma.order.findMany({
        where: {
          farmerId: user.farmer.id,
          status: { not: 'cart' }
        },
        include: {
          product: true,
          buyer: {
            include: {
              user: { select: { fullName: true, email: true } }
            }
          }
        },
        orderBy: { orderDate: 'desc' },
        take: 10
      }),

      // Low stock products (quantity < 10)
      prisma.product.findMany({
        where: {
          farmerId: user.farmer.id,
          quantity: { lt: 10 },
          status: 'available'
        },
        orderBy: { quantity: 'asc' },
        take: 5
      })
    ]);

    const stats = {
      totalProducts,
      totalOrders,
      activeOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      monthlyRevenue: monthlyRevenue._sum.totalPrice || 0,
      monthlyOrders,
      totalReviews: 0, // Default value if Review model doesn't exist
      averageRating: 4.5, // Default rating
      unreadMessages: 0 // Default value if Message model doesn't exist
    };

    // Format recent orders for display
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      productName: order.product?.name || 'Unknown Product',
      buyerName: order.buyer?.user?.fullName || 'Unknown Buyer',
      buyerEmail: order.buyer?.user?.email || '',
      quantity: order.quantity,
      totalPrice: order.totalPrice,
      status: order.status,
      orderDate: order.orderDate,
      deliveryStatus: order.deliveryStatus || 'Pending',
      paymentStatus: order.paymentStatus || 'Pending'
    }));

    // Format low stock products
    const formattedLowStockProducts = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      grade: product.grade || '',
      quantity: product.quantity,
      //price: product.price,
      status: product.status,
      //origin: product.origin || '',
      altitude: product.altitude || ''
    }));

    // Get sales data for charts
    const salesData = await getSalesData(user.farmer.id);
    const productPerformance = await getProductPerformance(user.farmer.id);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        recentOrders: formattedRecentOrders,
        lowStockProducts: formattedLowStockProducts,
        topBuyers: [], // Empty array if function fails
        recentMessages: [], // Empty array if Message model doesn't exist
        salesData,
        productPerformance,
        farmerProfile: {
          ...user.farmer,
          farmName: user.farmer.farmName || '',
          region: user.farmer.region || '',
          residence: user.farmer.residence || '',
          farmSize: user.farmer.farmSize || '',
         // experience: user.farmer.experience || 0,
          certifications: user.farmer.certifications || [],
          user: {
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || ''
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching farmer dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

async function getSalesData(farmerId: number) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await prisma.order.groupBy({
      by: ['orderDate'],
      where: {
        farmerId,
        status: { not: 'cart' },
        orderDate: { gte: sixMonthsAgo }
      },
      _sum: { totalPrice: true },
      _count: true
    });

    // Group by month
    const monthlyData: Record<string, { total: number; orders: number }> = {};
    
    monthlySales.forEach(sale => {
      const month = sale.orderDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { total: 0, orders: 0 };
      }
      monthlyData[month].total += (sale._sum.totalPrice || 0);
      monthlyData[month].orders += sale._count;
    });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      total: data.total,
      orders: data.orders
    }));
  } catch (error) {
    console.log('Error fetching sales data:', error);
    return [];
  }
}

async function getProductPerformance(farmerId: number) {
  try {
    // Get product performance data
    const productPerformance = await prisma.order.groupBy({
      by: ['productId'],
      where: {
        farmerId,
        status: { not: 'cart' },
        productId: { not: null } // Only include orders with productId
      },
      _count: true,
      _sum: { 
        quantity: true,
        totalPrice: true 
      },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 10
    });

    // Fetch product details for each productId
    const productPerformanceDetails = await Promise.all(
      productPerformance.map(async (item) => {
        // Check if productId is not null
        if (item.productId === null) {
          return null;
        }

        try {
          const product = await prisma.product.findUnique({
            where: { id: item.productId } // productId is guaranteed to be number here
          });

          return {
            productId: product?.id,
            productName: product?.name || 'Unknown Product',
            grade: product?.grade || '',
            //price: product?.price || 0,
            totalSold: item._sum.quantity || 0,
            totalRevenue: item._sum.totalPrice || 0,
            orderCount: item._count
          };
        } catch (error) {
          console.log(`Error fetching product ${item.productId}:`, error);
          return null;
        }
      })
    );

    // Filter out null values
    return productPerformanceDetails.filter(item => item !== null);
  } catch (error) {
    console.log('Error fetching product performance:', error);
    return [];
  }
}

// POST /api/farmer/dashboard - Update farmer profile or product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { farmer: true }
    });

    if (!user?.farmer) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'updateProfile':
        result = await prisma.farmer.update({
          where: { id: user.farmer.id },
          data: {
            farmName: data.farmName,
            region: data.region,
            residence: data.residence,
            farmSize: data.farmSize,
            experience: data.experience,
            certifications: data.certifications
          }
        });
        break;

      case 'updateProduct':
        result = await prisma.product.update({
          where: { 
            id: data.id,
            farmerId: user.farmer.id 
          },
          data: {
            name: data.name,
            grade: data.grade,
            quantity: data.quantity,
            price: data.price,
            status: data.status,
            origin: data.origin,
            altitude: data.altitude,
            description: data.description,
            certifications: data.certifications
          }
        });
        break;

      case 'addProduct':
        result = await prisma.product.create({
          data: {
            ...data,
            farmerId: user.farmer.id,
            status: 'available'
          }
        });
        break;

      case 'updateOrderStatus':
        result = await prisma.order.update({
          where: { 
            id: data.orderId,
            farmerId: user.farmer.id 
          },
          data: {
            status: data.status,
            deliveryStatus: data.deliveryStatus,
            paymentStatus: data.paymentStatus
          }
        });
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${action} updated successfully`
    });
  } catch (error) {
    console.error('Error updating farmer dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}