import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/insights?range=week|month|quarter|year
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);

    // verifyFarmerSession already resolves the farmer row, which only exists
    // for farmer accounts — checking the raw role string here was redundant
    // and never matched.
    if (!session.isValid || !session.farmerId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const farmerId = session.farmerId;
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || 'month';
    
    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
    }
    
    // Get sales data
    const orders = await prisma.order.findMany({
      where: {
        farmerId,
        orderDate: { gte: startDate },
        status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      },
      include: {
        product: {
          select: { name: true, category: true }
        }
      },
      orderBy: { orderDate: 'asc' }
    });
    
    // Get products data
    const products = await prisma.product.findMany({
      where: { farmerId },
      select: {
        name: true,
        quantity: true,
        pricePerUnit: true,
        category: true,
        status: true,
      }
    });
    
    // Calculate monthly sales data
    const monthlySales: { [key: string]: { revenue: number; orders: number; avgOrder: number } } = {};
    
    orders.forEach(order => {
      const month = order.orderDate.toLocaleString('default', { month: 'short' });
      if (!monthlySales[month]) {
        monthlySales[month] = { revenue: 0, orders: 0, avgOrder: 0 };
      }
      monthlySales[month].revenue += order.totalPrice;
      monthlySales[month].orders += 1;
    });
    
    // Calculate average order values
    Object.keys(monthlySales).forEach(month => {
      monthlySales[month].avgOrder = monthlySales[month].revenue / monthlySales[month].orders;
    });
    
    const salesData = Object.entries(monthlySales).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
      avgOrder: data.avgOrder,
    }));
    
    // Calculate stock data
    const stockData = products.map(product => ({
      product: product.name,
      quantity: product.quantity,
      value: product.quantity * product.pricePerUnit,
      category: product.category,
    }));
    
    // Calculate performance metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get previous period for growth calculation
    const prevStartDate = new Date(startDate);
    prevStartDate.setMonth(prevStartDate.getMonth() - (range === 'month' ? 1 : range === 'quarter' ? 3 : range === 'year' ? 12 : 0));
    
    const prevOrders = await prisma.order.findMany({
      where: {
        farmerId,
        orderDate: { gte: prevStartDate, lt: startDate },
        status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] }
      }
    });
    
    const prevRevenue = prevOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const growthRate = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 100;
    
    // Calculate low stock items (less than 10% of average stock)
    const avgStock = products.reduce((sum, p) => sum + p.quantity, 0) / products.length;
    const lowStockThreshold = avgStock * 0.1;
    const lowStockItems = products.filter(p => p.quantity < lowStockThreshold).length;
    
    const totalStockValue = products.reduce((sum, p) => sum + (p.quantity * p.pricePerUnit), 0);
    
    // Top products by revenue
    const productRevenue: { [key: string]: { revenue: number; quantity: number } } = {};
    
    orders.forEach(order => {
      const productName = order.product?.name || 'Unknown';
      if (!productRevenue[productName]) {
        productRevenue[productName] = { revenue: 0, quantity: 0 };
      }
      productRevenue[productName].revenue += order.totalPrice;
      productRevenue[productName].quantity += order.quantity;
    });
    
    const topProducts = Object.entries(productRevenue)
      .map(([name, data]) => ({ name, revenue: data.revenue, quantity: data.quantity }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Recent orders
    const recentOrders = orders
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        product: order.product?.name || 'Unknown',
        quantity: order.quantity,
        revenue: order.totalPrice,
        date: order.orderDate.toISOString().split('T')[0],
      }));
    
    return NextResponse.json({
      success: true,
      insights: {
        salesData,
        stockData,
        performance: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          growthRate,
          lowStockItems,
          totalStockValue,
        },
        topProducts,
        recentOrders,
      }
    });
    
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load insights' },
      { status: 500 }
    );
  }
}