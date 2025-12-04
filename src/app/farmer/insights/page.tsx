"use client";

import { useEffect, useState } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

interface SalesData {
  month: string;
  revenue: number;
  orders: number;
  avgOrder: number;
}

interface StockData {
  product: string;
  quantity: number;
  value: number;
  category: string;
}

interface PerformanceMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  growthRate: number;
  lowStockItems: number;
  totalStockValue: number;
}

interface InsightsData {
  salesData: SalesData[];
  stockData: StockData[];
  performance: PerformanceMetrics;
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
  }>;
  recentOrders: Array<{
    id: number;
    product: string;
    quantity: number;
    revenue: number;
    date: string;
  }>;
}

export default function FarmerInsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter" | "year">("month");

  useEffect(() => {
    async function loadInsights() {
      try {
        const res = await fetch(`/api/farmer/insights?range=${timeRange}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();

        // Handle different response formats
        if (data.insights) {
          setInsights(data.insights);
        } else if (data) {
          setInsights(data);
        } else {
          throw new Error("No insights data received");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load insights";
        setError(errorMessage);
        console.error("Error loading insights:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [timeRange]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const STOCK_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-700 mb-6"></div>
            <p className="text-xl font-semibold text-gray-700 mb-2">Loading Insights Dashboard</p>
            <p className="text-gray-500">Analyzing your farming data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-3">Error Loading Insights</h2>
            <p className="text-red-600 text-center mb-6 max-w-md">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen bg-amber-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center min-h-[600px]">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
              <span className="text-3xl">📈</span>
            </div>
            <h2 className="text-2xl font-bold text-amber-900 mb-3">No Insights Data</h2>
            <p className="text-gray-600 text-center mb-6 max-w-md">
              Start selling your products to generate insights and analytics
            </p>
            <button
              onClick={() => window.location.href = '/farmer/products'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              Go to Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Prepare data for Pie chart
  const pieChartData = insights.stockData.map(item => ({ 
    name: item.product, 
    value: item.quantity 
  }));

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Farm Insights Dashboard</h1>
            <p className="text-gray-600 mt-1">Analytics and performance metrics for your farm</p>
          </div>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === range
                    ? "bg-amber-700 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  ₮ {insights.performance.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className={`${insights.performance.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.performance.growthRate >= 0 ? '↗' : '↘'} {Math.abs(insights.performance.growthRate)}%
                </span>
                <span className="text-gray-500 ml-2">vs last period</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {insights.performance.totalOrders}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Completed orders</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-amber-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  ₮ {insights.performance.avgOrderValue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Per order average</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Value</p>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  ₮ {insights.performance.totalStockValue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🏪</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">Current inventory value</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
              <span className="text-sm text-gray-500">Last {timeRange}</span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={insights.salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    formatter={(value) => [`₮ ${Number(value).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stock Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Stock Distribution</h3>
              <span className="text-sm text-gray-500">
                {insights.stockData.length} products
              </span>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent }) => percent ? `${(percent * 100).toFixed(0)}%` : ''}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => {
                      const payload = props.payload as { name: string; value: number };
                      return [`${value} kg`, payload.name || name];
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Top Performing Products</h3>
            <div className="space-y-4">
              {insights.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-4">
                      <span className="font-bold text-amber-700">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.quantity} kg sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">₮ {product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Orders</h3>
            <div className="space-y-4">
              {insights.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-700">₮ {order.revenue.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{order.quantity} kg • {order.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {insights.performance.lowStockItems > 0 && (
          <div className="mt-8 p-6 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
                <p className="text-red-600">
                  You have {insights.performance.lowStockItems} products with low inventory. 
                  Consider restocking soon.
                </p>
              </div>
              <button className="ml-auto px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}