// app/api/farmer/insights/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs'; // Prevent Edge Runtime errors

export async function GET() {
  try {
    // Return static mock data to prevent hydration errors
    const insights = {
      salesData: [
        { month: 'Jan', revenue: 4000, orders: 24, avgOrder: 166.67 },
        { month: 'Feb', revenue: 3000, orders: 13, avgOrder: 230.77 },
        { month: 'Mar', revenue: 2000, orders: 18, avgOrder: 111.11 },
        { month: 'Apr', revenue: 2780, orders: 19, avgOrder: 146.32 },
        { month: 'May', revenue: 1890, orders: 15, avgOrder: 126.00 },
        { month: 'Jun', revenue: 2390, orders: 20, avgOrder: 119.50 },
      ],
      stockData: [
        { product: 'Coffee Beans', quantity: 50, value: 1200, category: 'Coffee' },
        { product: 'Tea Leaves', quantity: 30, value: 900, category: 'Tea' },
        { product: 'Honey', quantity: 20, value: 1500, category: 'Sweeteners' },
        { product: 'Spices', quantity: 15, value: 750, category: 'Spices' },
      ],
      performance: {
        totalRevenue: 16060,
        totalOrders: 109,
        avgOrderValue: 147.34,
        growthRate: 12.5,
        lowStockItems: 2,
        totalStockValue: 4350,
      },
      topProducts: [
        { name: 'Premium Coffee', revenue: 8000, quantity: 40 },
        { name: 'Organic Honey', revenue: 4500, quantity: 15 },
        { name: 'Green Tea', revenue: 3560, quantity: 28 },
      ],
      recentOrders: [
        { id: 1001, product: 'Coffee Beans', quantity: 5, revenue: 600, date: '2024-01-15' },
        { id: 1002, product: 'Honey', quantity: 2, revenue: 300, date: '2024-01-14' },
        { id: 1003, product: 'Tea Leaves', quantity: 3, revenue: 270, date: '2024-01-13' },
      ],
    };
    
    return NextResponse.json(insights);
    
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}