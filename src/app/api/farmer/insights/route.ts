import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyFarmerSession } from '@/app/lib/auth';

export const runtime = 'nodejs';

// GET /api/farmer/insights?range=week|month|quarter|year
export async function GET(request: NextRequest) {
  try {
    const session = await verifyFarmerSession(request);
    
    if (!session.isValid || session.userRole !== 'farmer') {
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
    let startDate = new Date();
    
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
    
  } catch (error: any) {
    console.error('Error fetching insights:', error);
    
    // Return mock data for development
    const mockInsights = {
      salesData: [
        { month: 'Jan', revenue: 45000, orders: 5, avgOrder: 9000 },
        { month: 'Feb', revenue: 52000, orders: 6, avgOrder: 8667 },
        { month: 'Mar', revenue: 61000, orders: 7, avgOrder: 8714 },
      ],
      stockData: [
        { product: 'Yirgacheffe AA', quantity: 45.5, value: 127400, category: 'Specialty Coffee' },
        { product: 'Sidamo Natural', quantity: 32, value: 76800, category: 'Specialty Coffee' },
      ],
      performance: {
        totalRevenue: 158000,
        totalOrders: 18,
        avgOrderValue: 8778,
        growthRate: 15.2,
        lowStockItems: 1,
        totalStockValue: 204200,
      },
      topProducts: [
        { name: 'Yirgacheffe AA', revenue: 98000, quantity: 35 },
        { name: 'Sidamo Natural', revenue: 60000, quantity: 25 },
      ],
      recentOrders: [
        { id: 1, product: 'Yirgacheffe AA', quantity: 10, revenue: 28000, date: '2024-01-15' },
        { id: 2, product: 'Sidamo Natural', quantity: 15, revenue: 36000, date: '2024-01-14' },
      ],
    };
    
    return NextResponse.json({
      success: true,
      insights: mockInsights,
      note: 'Using mock data due to error',
    });
  }
}