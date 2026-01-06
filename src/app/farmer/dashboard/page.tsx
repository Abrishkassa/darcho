// app/farmer/dashboard/page.tsx - Updated to use the new API
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coffee,
  Package,
  ShoppingBag,
  User,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Zap,
  Sparkles,
  ChevronRight,
  Leaf,
  Mountain,
  MapPin,
  Calendar,
  Eye,
  Edit,
  MoreVertical,
  Filter,
  Search,
  Shield,
  Award,
  Truck,
  MessageCircle,
  LogOut,
  Settings,
  Bell,
  HelpCircle,
  TrendingUp as TrendingUpIcon,
  ShoppingCart
} from "lucide-react";

type DashboardData = {
  success: boolean;
  data: {
    stats: {
      totalProducts: number;
      totalOrders: number;
      activeOrders: number;
      pendingOrders: number;
      completedOrders: number;
      totalRevenue: number;
      monthlyRevenue: number;
      monthlyOrders: number;
      totalReviews: number;
      averageRating: number;
      unreadMessages: number;
    };
    recentOrders: Array<{
      id: number;
      orderNumber: string;
      productName: string;
      buyerName: string;
      buyerEmail: string;
      quantity: number;
      totalPrice: number;
      status: string;
      orderDate: string;
      deliveryStatus: string;
      paymentStatus: string;
    }>;
    lowStockProducts: Array<{
      id: number;
      name: string;
      grade: string;
      quantity: number;
      price: number;
      status: string;
      origin: string;
      altitude: string;
    }>;
    topBuyers: Array<any>;
    recentMessages: Array<any>;
    salesData: Array<{
      month: string;
      total: number;
      orders: number;
    }>;
    productPerformance: Array<{
      productId: number;
      productName: string;
      grade: string;
      price: number;
      totalSold: number;
      totalRevenue: number;
      orderCount: number;
    }>;
    farmerProfile: {
      id: number;
      farmName: string;
      region: string;
      residence: string;
      farmSize: string;
      experience: number;
      certifications: string[];
      user: {
        fullName: string;
        email: string;
        phone: string;
      };
    };
  };
};

export default function FarmerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders" | "profile" | "insights">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // AUTH + ROLE GUARD
  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (session?.user?.role !== "farmer") {
      router.replace("/login");
      return;
    }
  }, [sessionStatus, session, router]);

  // FETCH DASHBOARD DATA
  useEffect(() => {
    if (session?.user?.role !== "farmer") return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/farmer/dashboard", {
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  // HARD UI GUARD
  if (sessionStatus === "authenticated" && session?.user?.role !== "farmer") {
    return null;
  }

  // LOADING STATE
  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard...</h2>
          <p className="text-gray-600 mt-2">Preparing your farmer portal</p>
        </div>
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">No Data Available</h2>
          <p className="text-gray-600 mt-2">Unable to load dashboard data</p>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts, farmerProfile, salesData, productPerformance } = dashboardData.data;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
      case "available":
        return "bg-emerald-100 text-emerald-700";
      case "processing":
      case "confirmed":
        return "bg-amber-100 text-amber-700";
      case "pending":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
      case "out_of_stock":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
      case "completed":
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "processing":
      case "confirmed":
        return <Clock className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "profile", label: "Profile", icon: User },
    { id: "insights", label: "Insights", icon: TrendingUpIcon },
  ];

  const mainStats = [
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "emerald", change: "+12%" },
    { label: "Monthly Revenue", value: formatCurrency(stats.monthlyRevenue), icon: TrendingUp, color: "amber", change: "+8%" },
    { label: "Active Orders", value: stats.activeOrders.toString(), icon: ShoppingBag, color: "blue", change: "+2" },
    { label: "Products", value: stats.totalProducts.toString(), icon: Package, color: "purple", change: "+1" },
    { label: "Avg. Rating", value: stats.averageRating.toFixed(1), icon: Star, color: "yellow", change: "+0.1" },
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, color: "indigo", change: "+15%" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {farmerProfile.user.fullName}!</h1>
                  <p className="text-amber-100 mt-2">Here's what's happening with your farm today</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="text-sm text-amber-100">Last updated</div>
                  <div className="font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      stat.color === "emerald" ? "bg-emerald-100" :
                      stat.color === "amber" ? "bg-amber-100" :
                      stat.color === "blue" ? "bg-blue-100" :
                      stat.color === "purple" ? "bg-purple-100" :
                      stat.color === "yellow" ? "bg-yellow-100" :
                      "bg-indigo-100"
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === "emerald" ? "text-emerald-600" :
                        stat.color === "amber" ? "text-amber-600" :
                        stat.color === "blue" ? "text-blue-600" :
                        stat.color === "purple" ? "text-purple-600" :
                        stat.color === "yellow" ? "text-yellow-600" :
                        "text-indigo-600"
                      }`} />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders & Low Stock Products */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                  <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                    View All →
                  </button>
                </div>
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-600">{order.buyerName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-600">{formatCurrency(order.totalPrice)}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Stock Products */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Low Stock Alert</h3>
                  <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                    {lowStockProducts.length} items
                  </button>
                </div>
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors">
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-600">{product.grade} • {product.origin}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${product.quantity < 5 ? 'text-red-600' : 'text-amber-600'}`}>
                          {product.quantity} kg
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatCurrency(product.price)}/kg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sales Chart Placeholder */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Overview</h3>
              <div className="h-64 rounded-lg bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <div className="text-gray-600">Sales chart for last 6 months</div>
                  <div className="text-sm text-gray-500 mt-2">
                    Total: {formatCurrency(salesData.reduce((sum, month) => sum + month.total, 0))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Products</h1>
                <p className="mt-2 text-gray-600">
                  Manage your coffee products and inventory
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg transition-all flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Add New Product
                </button>
              </div>
            </div>

            {/* Product performance */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {productPerformance.length > 0 ? productPerformance[0].productName : "N/A"}
                    </div>
                    <div className="text-sm text-gray-600">Best Seller</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {productPerformance.reduce((sum, p) => sum + p.totalRevenue, 0) > 0 
                        ? formatCurrency(productPerformance.reduce((sum, p) => sum + p.totalRevenue, 0))
                        : "ETB 0"}
                    </div>
                    <div className="text-sm text-gray-600">Products Revenue</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.totalProducts}
                    </div>
                    <div className="text-sm text-gray-600">Total Products</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product list would go here */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Product Management</h3>
                <p className="text-gray-600 mb-6">Manage your coffee products inventory</p>
                <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:shadow-lg transition-all">
                  View All Products
                </button>
              </div>
            </div>
          </div>
        );

      // Add other tab contents (orders, profile, insights) based on your existing code
      default:
        return <div>Coming soon...</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold text-gray-900">Darcho Farmer</span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                Premium
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 relative">
                <Bell className="w-5 h-5" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
              
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold cursor-pointer">
                  {farmerProfile.user.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{farmerProfile.user.fullName}</div>
                    <div className="text-sm text-gray-600">{farmerProfile.user.email}</div>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button 
                    onClick={() => router.push("/login")}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mt-8 py-6 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Darcho - Direct Coffee Marketplace. Empowering Ethiopian farmers.
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Support
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Privacy
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}