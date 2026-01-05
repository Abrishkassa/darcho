"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Truck, 
  User, 
  Heart, 
  MessageCircle,
  Bell,
  Search,
  Coffee,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Star,
  Zap,
  BarChart3,
  DollarSign,
  Users as UsersIcon,
  Award,
  ChevronRight,
  Sparkles,
  Shield,
  Globe,
  MapPin,
  Phone,
  Settings,
  LogOut,
  Sun,
  Moon,
  MessageSquare,
  ChevronLeft,
  Menu,
  X,
  Plus,
  MoreVertical,
  Download,
  Calendar,
  Target,
  Clock,
  RefreshCw,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

// Types based on your Prisma schema
interface Product {
  id: number;
  name: string;
  grade: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  originRegion: string;
  certifications: string[];
  farmer: {
    user: {
      fullName: string;
    };
  };
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalPrice: number;
  orderDate: string;
  product: Product;
}

interface Farmer {
  id: number;
  userId: number;
  farmName: string | null;
  region: string;
  user: {
    fullName: string;
  };
  orderCount: number;
  totalSpent: number;
}

interface DashboardData {
  stats: {
    totalOrders: number;
    cartItems: number;
    favorites: number;
    activeChats: number;
    totalSpent: number;
  };
  recentOrders: Order[];
  monthlyData: Array<{
    month: string;
    total: number;
    orders: number;
  }>;
  topFarmers: Farmer[];
  recommendedProducts: Product[];
  buyerProfile: {
    companyName: string | null;
    businessType: string | null;
    location: string | null;
  };
}

export default function BuyerDashboardPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "analytics" | "settings">("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      redirect("/login");
    }
  }, [sessionStatus]);

  // Fetch dashboard data with proper authentication
  const fetchDashboardData = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/buyer/dashboard', {
        credentials: 'include', // This sends cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      // Set mock data for development
      setDashboardData(getMockData());
    } finally {
      setLoading(false);
    }
  };

  // Initialize data fetch when session is available
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  const sidebarTabs = [
    { id: "dashboard", label: "Dashboard", icon: Home, href: "/buyer/dashboard" },
    { id: "products", label: "Browse Products", icon: Package, href: "/buyer" },
    { id: "cart", label: "Shopping Cart", icon: ShoppingCart, href: "/buyer/cart" },
    { id: "orders", label: "My Orders", icon: Truck, href: "/buyer/orders" },
    { id: "profile", label: "Profile", icon: User, href: "/buyer/profile" },
    { id: "favorites", label: "Favorites", icon: Heart, href: "/buyer/favorites" },
    { id: "chats", label: "Chats", icon: MessageCircle, href: "/buyer/chats" },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate stats for display
  const calculateStats = () => {
    if (!dashboardData) return [];
    
    const { stats, monthlyData } = dashboardData;
    
    // Calculate monthly growth
    const monthlyGrowth = monthlyData.length >= 2 
      ? ((monthlyData[monthlyData.length - 1]?.total || 0) - (monthlyData[monthlyData.length - 2]?.total || 0)) / 
        (monthlyData[monthlyData.length - 2]?.total || 1) * 100
      : 0;

    return [
      { 
        label: "Total Orders", 
        value: stats.totalOrders.toString(), 
        change: monthlyData.length > 0 ? `+${monthlyData[monthlyData.length - 1]?.orders || 0} this month` : "No data", 
        trend: monthlyData.length > 0 && (monthlyData[monthlyData.length - 1]?.orders || 0) > 0 ? "up" : "neutral",
        icon: Package, 
        color: "blue" 
      },
      { 
        label: "Total Spent", 
        value: formatCurrency(stats.totalSpent), 
        change: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth.toFixed(1)}%`, 
        trend: monthlyGrowth > 0 ? "up" : monthlyGrowth < 0 ? "down" : "neutral",
        icon: DollarSign, 
        color: "amber" 
      },
      { 
        label: "Favorites", 
        value: stats.favorites.toString(), 
        change: "+3 recently", 
        trend: "up",
        icon: Heart, 
        color: "pink" 
      },
      { 
        label: "Active Chats", 
        value: stats.activeChats.toString(), 
        change: stats.activeChats > 0 ? "Unread messages" : "All caught up", 
        trend: stats.activeChats > 0 ? "up" : "neutral",
        icon: MessageCircle, 
        color: "green" 
      },
      { 
        label: "Monthly Spend", 
        value: monthlyData.length > 0 ? formatCurrency(monthlyData[monthlyData.length - 1]?.total || 0) : "₮ 0", 
        change: monthlyData.length > 0 ? `${monthlyData[monthlyData.length - 1]?.orders || 0} orders` : "No orders", 
        trend: "up",
        icon: ShoppingCart, 
        color: "purple" 
      },
      { 
        label: "Top Farmer", 
        value: dashboardData.topFarmers[0]?.user.fullName.split(' ')[0] || "None", 
        change: dashboardData.topFarmers[0] ? `${dashboardData.topFarmers[0].orderCount} orders` : "Start ordering", 
        trend: "up",
        icon: UsersIcon, 
        color: "emerald" 
      },
    ];
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Show loading while checking auth
  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Checking authentication...</h2>
        </div>
      </div>
    );
  }

  // Render content based on active tab
  const renderContent = () => {
    if (sessionStatus === "unauthenticated") {
      return (
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please login to access the dashboard</p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all"
          >
            Go to Login
          </Link>
        </div>
      );
    }

    if (loading && !dashboardData) {
      return (
        <div className="space-y-6">
          {/* Skeleton Loading */}
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white/80 border-gray-200"
            } shadow-lg animate-pulse`}>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(j => (
                  <div key={j} className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
          darkMode 
            ? "bg-gray-800/50 border-gray-700" 
            : "bg-white/80 border-gray-200"
        } shadow-lg`}>
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
              Unable to Load Dashboard
            </h3>
            <p className={darkMode ? "text-gray-400 mb-6" : "text-gray-600 mb-6"}>
              {error}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={fetchDashboardData}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 rounded-xl border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Re-login
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!dashboardData) return null;

    const stats = calculateStats();
    const { recentOrders, topFarmers, recommendedProducts, buyerProfile } = dashboardData;

    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Sparkles className="w-6 h-6" />
                      <span className="text-amber-100 font-semibold">Welcome back!</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3">
                      Hello, {session?.user?.name || buyerProfile.companyName || buyerProfile.businessType || "Coffee Buyer"} 👋
                    </h1>
                    <p className="text-amber-100 max-w-2xl">
                      Your coffee trading dashboard is updated with the latest market insights and recommendations.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <button 
                      onClick={fetchDashboardData}
                      disabled={loading}
                      className="px-6 py-3 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                      {loading ? "Refreshing..." : "Refresh Data"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200"
                  } shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      darkMode 
                        ? `bg-${stat.color}-900/30` 
                        : `bg-${stat.color}-100`
                    }`}>
                      <stat.icon className={`w-6 h-6 ${
                        darkMode 
                          ? `text-${stat.color}-400` 
                          : `text-${stat.color}-600`
                      }`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" 
                        ? "text-emerald-500" 
                        : stat.trend === "down"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}>
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : 
                       stat.trend === "down" ? <TrendingDown className="w-4 h-4" /> :
                       <Clock className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Recent Orders */}
              <div className={`lg:col-span-2 p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Orders</h3>
                  <Link 
                    href="/buyer/orders"
                    className={`text-sm hover:underline flex items-center gap-1 ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentOrders.length > 0 ? (
                    recentOrders.map(order => (
                      <div key={order.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                        darkMode 
                          ? "border-gray-700 hover:bg-gray-800/50" 
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <Coffee className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {order.product.name}
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Farmer: {order.product.farmer.user.fullName} • {formatDate(order.orderDate)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-500">{formatCurrency(order.totalPrice)}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                              order.status === "delivered" 
                                ? darkMode 
                                  ? "bg-emerald-900/30 text-emerald-400" 
                                  : "bg-emerald-100 text-emerald-700"
                                : order.status === "shipped"
                                ? darkMode 
                                  ? "bg-blue-900/30 text-blue-400" 
                                  : "bg-blue-100 text-blue-700"
                                : order.status === "processing"
                                ? darkMode 
                                  ? "bg-amber-900/30 text-amber-400" 
                                  : "bg-amber-100 text-amber-700"
                                : darkMode 
                                  ? "bg-gray-700 text-gray-300" 
                                  : "bg-gray-100 text-gray-700"
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No orders yet. Start browsing products!</p>
                      <Link
                        href="/buyer"
                        className="inline-block mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                      >
                        Browse Products
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Products */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recommended For You</h3>
                  <Link 
                    href="/buyer"
                    className={`text-sm hover:underline flex items-center gap-1 ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  >
                    Browse All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="space-y-4">
                  {recommendedProducts.length > 0 ? (
                    recommendedProducts.map(product => (
                      <div key={product.id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                        darkMode 
                          ? "border-gray-700 hover:bg-gray-800/50" 
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}>
                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                          <Coffee className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {product.name}
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {product.originRegion}
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                              <span className="text-sm">{product.grade}</span>
                            </div>
                            <div className={`text-sm px-2 py-0.5 rounded-full ${
                              product.quantity < 10
                                ? darkMode 
                                  ? "bg-red-900/30 text-red-400" 
                                  : "bg-red-100 text-red-700"
                                : product.quantity < 50
                                ? darkMode 
                                  ? "bg-amber-900/30 text-amber-400" 
                                  : "bg-amber-100 text-amber-700"
                                : darkMode 
                                  ? "bg-green-900/30 text-green-400" 
                                  : "bg-green-100 text-green-700"
                            }`}>
                              {product.quantity} {product.unit} left
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-500">
                            {formatCurrency(product.pricePerUnit)}/{product.unit}
                          </div>
                          <button className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <Coffee className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No recommendations yet. Make your first order!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Top Farmers */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Top Farmers</h3>
                  <button className={`text-sm hover:underline flex items-center gap-1 ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}>
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {topFarmers.length > 0 ? (
                    topFarmers.map(farmer => (
                      <div key={farmer.id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                        darkMode 
                          ? "border-gray-700 hover:bg-gray-800/50" 
                          : "border-gray-200 hover:bg-gray-50"
                      } transition-colors`}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {farmer.user.fullName}
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {farmer.region} • {farmer.orderCount} orders
                          </div>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 text-emerald-500" />
                              <span className="text-sm">{formatCurrency(farmer.totalSpent)} spent</span>
                            </div>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No farmer data yet. Start ordering!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <h3 className={`text-lg font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Globe, label: "Browse Regions", color: "blue", href: "/buyer" },
                    { icon: MapPin, label: "Track Order", color: "green", href: "/buyer/orders" },
                    { icon: Phone, label: "Contact Support", color: "purple", href: "/buyer/chats" },
                    { icon: Award, label: "View Ratings", color: "amber", href: "#" },
                    { icon: Download, label: "Export Data", color: "cyan", href: "#" },
                    { icon: Target, label: "Set Goals", color: "pink", href: "#" },
                  ].map(action => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className={`p-4 rounded-xl border hover:shadow-md transition-all flex flex-col items-center gap-3 ${
                        darkMode 
                          ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50" 
                          : "bg-gray-50 border-gray-200 hover:bg-white"
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${
                        darkMode 
                          ? `bg-${action.color}-900/30` 
                          : `bg-${action.color}-100`
                      }`}>
                        <action.icon className={`w-6 h-6 ${
                          darkMode 
                            ? `text-${action.color}-400` 
                            : `text-${action.color}-600`
                        }`} />
                      </div>
                      <span className={`font-medium text-sm text-center ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Monthly Spending */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Monthly Spending</h3>
                  <span className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    Last 6 months
                  </span>
                </div>
                <div className="space-y-4">
                  {dashboardData.monthlyData.length > 0 ? (
                    dashboardData.monthlyData.map((month, index) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-8 rounded-full ${
                            index === dashboardData.monthlyData.length - 1
                              ? "bg-gradient-to-b from-amber-500 to-orange-500"
                              : darkMode 
                                ? "bg-gray-700" 
                                : "bg-gray-300"
                          }`} />
                          <div>
                            <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>
                              {month.month}
                            </div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {month.orders} orders
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-amber-500">
                            {formatCurrency(month.total)}
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {month.total > 0 ? "Spent" : "No spending"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No spending data yet</p>
                    </div>
                  )}
                </div>
                <div className={`mt-6 pt-6 border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <Link
                    href="/buyer/analytics"
                    className={`w-full py-3 rounded-lg border-2 border-dashed text-center transition-colors flex items-center justify-center gap-2 ${
                      darkMode 
                        ? "border-gray-600 text-gray-400 hover:border-amber-500 hover:text-amber-400" 
                        : "border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-600"
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                    View Full Analytics
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );

      case "products":
      case "analytics":
      case "settings":
        return (
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white/80 border-gray-200"
          } shadow-lg`}>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                {activeTab === "products" && <Package className="w-10 h-10 text-white" />}
                {activeTab === "analytics" && <BarChart3 className="w-10 h-10 text-white" />}
                {activeTab === "settings" && <Settings className="w-10 h-10 text-white" />}
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {activeTab === "products" && "Product Analytics"}
                {activeTab === "analytics" && "Advanced Analytics"}
                {activeTab === "settings" && "Dashboard Settings"}
              </h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {activeTab === "products" && "Product analytics dashboard is under development"}
                {activeTab === "analytics" && "Advanced analytics features will be available soon"}
                {activeTab === "settings" && "Settings panel will be available in the next update"}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClass}`}>
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-40 backdrop-blur-xl border-b ${
        darkMode 
          ? "bg-gray-900/80 border-gray-800" 
          : "bg-white/80 border-gray-200"
      }`}>
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`md:hidden p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Desktop Sidebar Toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`hidden md:block p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-3">
                <Coffee className="w-6 h-6 text-amber-600" />
                <div>
                  <h1 className="text-xl font-bold">Buyer Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Direct trade with Ethiopian farmers
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? "bg-gray-800 text-amber-400 hover:bg-gray-700" 
                    : "bg-white text-amber-600 hover:bg-amber-50 border border-gray-200"
                }`}
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Search (Desktop) */}
              <div className="hidden md:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? "bg-gray-800 border-gray-700 text-white" 
                      : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchDashboardData}
                disabled={loading}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  loading ? "animate-spin" : ""
                }`}
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">
                    {session?.user?.name || dashboardData?.buyerProfile.companyName || "Buyer"}
                  </div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {dashboardData?.stats.totalOrders || 0} orders
                  </div>
                </div>
                <div className="relative">
                  <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileMenuOpen && (
            <div className="mt-4 md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode 
                      ? "bg-gray-800 border-gray-700 text-white" 
                      : "bg-white border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className={`sticky top-16 h-[calc(100vh-4rem)] border-r hidden md:block ${
            darkMode 
              ? "bg-gray-900/50 border-gray-800" 
              : "bg-white/50 border-gray-200"
          } backdrop-blur-sm transition-all duration-300 overflow-hidden`}
        >
          <div className="p-4">
            <div className="space-y-2">
              {sidebarTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = tab.href === "/buyer/dashboard";
                
                return (
                  <Link
                    key={tab.id}
                    href={tab.href}
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? darkMode
                            ? "bg-gradient-to-r from-amber-900/30 to-orange-900/20 text-amber-400 border border-amber-800/30"
                            : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border border-amber-200"
                          : darkMode
                            ? "hover:bg-gray-800/50 text-gray-300"
                            : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="font-medium"
                        >
                          {tab.label}
                        </motion.span>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-8 pt-6 border-t dark:border-gray-800"
              >
                <div className="space-y-2">
                  <button 
                    onClick={() => setActiveTab("settings")}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          {/* Tab Navigation */}
          <div className={`mb-6 p-4 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white/80 border-gray-200"
          } shadow-lg`}>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "overview", label: "Overview", icon: Home },
                { id: "products", label: "Products", icon: Package },
                { id: "analytics", label: "Analytics", icon: BarChart3 },
                { id: "settings", label: "Settings", icon: Settings },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                      isActive
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                        : darkMode
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {/* Active tab indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 -z-10"
                        transition={{ type: "spring", duration: 0.6 }}
                      />
                    )}
                    
                    {/* Icon */}
                    <div className={`transition-transform duration-300 ${
                      isActive 
                        ? "text-white" 
                        : darkMode 
                          ? "text-gray-400 group-hover:text-amber-400" 
                          : "text-gray-600 group-hover:text-amber-600"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Label */}
                    <span className="relative">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Mock data for development
function getMockData(): DashboardData {
  return {
    stats: {
      totalOrders: 24,
      cartItems: 3,
      favorites: 12,
      activeChats: 4,
      totalSpent: 186000
    },
    recentOrders: [
      {
        id: 1,
        orderNumber: "ORD-2024-015",
        status: "delivered",
        totalPrice: 28000,
        orderDate: new Date().toISOString(),
        product: {
          id: 1,
          name: "Yirgacheffe AA Premium",
          grade: "AA",
          category: "premium",
          quantity: 45,
          unit: "kg",
          pricePerUnit: 2800,
          description: "Floral and citrus notes with a clean finish",
          originRegion: "Yirgacheffe, Ethiopia",
          certifications: ["Organic", "Fair Trade"],
          farmer: {
            user: {
              fullName: "Abriham Kassa"
            }
          }
        }
      },
      {
        id: 2,
        orderNumber: "ORD-2024-014",
        status: "shipped",
        totalPrice: 12000,
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        product: {
          id: 2,
          name: "Sidamo Natural Process",
          grade: "A",
          category: "natural",
          quantity: 32,
          unit: "kg",
          pricePerUnit: 2400,
          description: "Fruity and winey notes with a bold body",
          originRegion: "Sidamo, Ethiopia",
          certifications: ["Organic"],
          farmer: {
            user: {
              fullName: "Selam Desta"
            }
          }
        }
      }
    ],
    monthlyData: [
      { month: "Aug", total: 24000, orders: 3 },
      { month: "Sep", total: 32000, orders: 4 },
      { month: "Oct", total: 28000, orders: 3 },
      { month: "Nov", total: 45000, orders: 5 },
      { month: "Dec", total: 52000, orders: 6 },
      { month: "Jan", total: 28000, orders: 3 }
    ],
    topFarmers: [
      {
        id: 1,
        userId: 1,
        farmName: "Kassa Farm",
        region: "Yirgacheffe",
        user: { fullName: "Abriham Kassa" },
        orderCount: 8,
        totalSpent: 112000
      },
      {
        id: 2,
        userId: 2,
        farmName: "Desta Coffee",
        region: "Sidamo",
        user: { fullName: "Selam Desta" },
        orderCount: 6,
        totalSpent: 72000
      },
      {
        id: 3,
        userId: 3,
        farmName: "Assefa Plantation",
        region: "Harar",
        user: { fullName: "Mikael Assefa" },
        orderCount: 4,
        totalSpent: 38400
      }
    ],
    recommendedProducts: [
      {
        id: 3,
        name: "Kochere Natural",
        grade: "A",
        category: "natural",
        quantity: 24,
        unit: "kg",
        pricePerUnit: 3000,
        description: "Sweet and complex with tropical fruit notes",
        originRegion: "Kochere, Ethiopia",
        certifications: ["Organic", "Fair Trade"],
        farmer: {
          user: {
            fullName: "Ruth Bekele"
          }
        }
      },
      {
        id: 4,
        name: "Wollega Organic",
        grade: "B",
        category: "organic",
        quantity: 65,
        unit: "kg",
        pricePerUnit: 2700,
        description: "Balanced with chocolate notes",
        originRegion: "Wollega, Ethiopia",
        certifications: ["Organic"],
        farmer: {
          user: {
            fullName: "Samuel Teklu"
          }
        }
      }
    ],
    buyerProfile: {
      companyName: "Coffee Importers Ltd",
      businessType: "importer",
      location: "Addis Ababa"
    }
  };
}