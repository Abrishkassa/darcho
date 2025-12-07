"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Clock,
  Star,
  Filter,
  Zap,
  BarChart3,
  DollarSign,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Shield,
  Globe,
  MapPin,
  Phone,
  Mail,
  Settings,
  LogOut,
  Sun,
  Moon,
  Eye,
  MessageSquare,
  ChevronLeft,
  Menu,
  X
} from "lucide-react";

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<"home" | "products" | "cart" | "orders" | "profile" | "favorites" | "chats">("home");
  const [notifications, setNotifications] = useState(5);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState(3);
  const [favorites, setFavorites] = useState([1, 3]);

  // Mock data
  const stats = [
    { label: "Total Orders", value: "24", change: "+12%", trend: "up", icon: Package, color: "blue" },
    { label: "Cart Value", value: "₮ 49.6K", change: "+8%", trend: "up", icon: ShoppingCart, color: "amber" },
    { label: "Favorites", value: "12", change: "+3", trend: "up", icon: Heart, color: "pink" },
    { label: "Active Chats", value: "4", change: "+1", trend: "up", icon: MessageCircle, color: "green" },
  ];

  const recentOrders = [
    { id: "ORD-2024-015", product: "Yirgacheffe AA", farmer: "Abriham", status: "delivered", amount: "₮ 28,000", date: "2 days ago" },
    { id: "ORD-2024-014", product: "Sidamo Natural", farmer: "Selam", status: "shipped", amount: "₮ 12,000", date: "3 days ago" },
    { id: "ORD-2024-013", product: "Harar Longberry", farmer: "Mikael", status: "processing", amount: "₮ 9,600", date: "5 days ago" },
    { id: "ORD-2024-012", product: "Limu Washed", farmer: "Helen", status: "delivered", amount: "₮ 15,600", date: "1 week ago" },
  ];

  const recommendedProducts = [
    { id: 1, name: "Guij Coffee AA", farmer: "Daniel", price: "₮ 2,900/kg", rating: 4.5, stock: "Low" },
    { id: 2, name: "Kochere Natural", farmer: "Ruth", price: "₮ 3,000/kg", rating: 4.9, stock: "Limited" },
    { id: 3, name: "Wollega Organic", farmer: "Samuel", price: "₮ 2,700/kg", rating: 4.3, stock: "High" },
    { id: 4, name: "Jimma Grade A", farmer: "Martha", price: "₮ 2,500/kg", rating: 4.2, stock: "Medium" },
  ];

  const tabs = [
    { id: "home", label: "Dashboard", icon: Home },
    { id: "products", label: "Products", icon: Package },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "orders", label: "Orders", icon: Truck },
    { id: "profile", label: "Profile", icon: User },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "chats", label: "Chats", icon: MessageCircle },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-amber-100 font-semibold">Welcome back!</span>
                </div>
                <h1 className="text-3xl font-bold mb-3">Hello, Selam Desta</h1>
                <p className="text-amber-100 max-w-2xl">
                  Your coffee journey continues. Discover new farmers, track your orders, and manage everything from one dashboard.
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-2xl backdrop-blur-sm border ${
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
                        : "text-red-500"
                    }`}>
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders & Recommendations */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>Recent Orders</h3>
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className={`text-sm hover:underline flex items-center gap-1 ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  >
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recentOrders.map(order => (
                    <div key={order.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                      darkMode 
                        ? "border-gray-700 hover:bg-gray-800/50" 
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}>
                      <div>
                        <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{order.product}</div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Farmer: {order.farmer} • {order.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-amber-500">{order.amount}</div>
                        <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                          order.status === "delivered" 
                            ? darkMode 
                              ? "bg-emerald-900/30 text-emerald-400" 
                              : "bg-emerald-100 text-emerald-700"
                            : order.status === "shipped"
                            ? darkMode 
                              ? "bg-blue-900/30 text-blue-400" 
                              : "bg-blue-100 text-blue-700"
                            : darkMode 
                              ? "bg-amber-900/30 text-amber-400" 
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <button 
                    onClick={() => setActiveTab("products")}
                    className={`text-sm hover:underline flex items-center gap-1 ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  >
                    Browse All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {recommendedProducts.map(product => (
                    <div key={product.id} className={`flex items-center gap-4 p-4 rounded-xl border ${
                      darkMode 
                        ? "border-gray-700 hover:bg-gray-800/50" 
                        : "border-gray-200 hover:bg-gray-50"
                    } transition-colors`}>
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{product.name}</div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Farmer: {product.farmer}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-sm">{product.rating}</span>
                          </div>
                          <div className={`text-sm px-2 py-0.5 rounded-full ${
                            product.stock === "Low" 
                              ? darkMode 
                                ? "bg-red-900/30 text-red-400" 
                                : "bg-red-100 text-red-700"
                              : product.stock === "Limited"
                              ? darkMode 
                                ? "bg-amber-900/30 text-amber-400" 
                                : "bg-amber-100 text-amber-700"
                              : darkMode 
                                ? "bg-green-900/30 text-green-400" 
                                : "bg-green-100 text-green-700"
                          }`}>
                            {product.stock} Stock
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-amber-500">{product.price}</div>
                        <button className="mt-2 px-3 py-1.5 text-sm rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <h3 className={`text-lg font-semibold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Globe, label: "Browse Regions", color: "blue", action: () => setActiveTab("products") },
                  { icon: MapPin, label: "Track Order", color: "green", action: () => setActiveTab("orders") },
                  { icon: Phone, label: "Contact Support", color: "purple", action: () => setActiveTab("chats") },
                  { icon: Award, label: "View Ratings", color: "amber", action: () => console.log("View ratings") },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={action.action}
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
                    <span className={`font-medium text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "products":
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Browse Products</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedProducts.map(product => (
                  <div key={product.id} className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{product.name}</h3>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{product.farmer}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                      <span className="font-bold text-amber-500">{product.price}</span>
                    </div>
                    <button className="w-full py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "cart":
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Your Cart</h2>
              <div className="space-y-4">
                {[
                  { name: "Yirgacheffe AA", price: "₮ 28,000", quantity: "10kg" },
                  { name: "Sidamo Natural", price: "₮ 12,000", quantity: "5kg" },
                  { name: "Harar Longberry", price: "₮ 9,600", quantity: "3kg" },
                ].map((item, index) => (
                  <div key={index} className={`flex items-center justify-between p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Coffee className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{item.name}</h4>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-amber-500">{item.price}</div>
                      <button className="mt-1 text-sm text-red-500 hover:text-red-600">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 pt-6 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Total</div>
                    <div className="text-2xl font-bold text-amber-500">₮ 49,600</div>
                  </div>
                  <button className="px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all">
                    Checkout Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>Your Orders</h2>
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>{order.id}</div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                          {order.product} • {order.date}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-amber-500">{order.amount}</div>
                        <div className={`text-sm px-2 py-1 rounded-full inline-block ${
                          order.status === "delivered" 
                            ? darkMode 
                              ? "bg-emerald-900/30 text-emerald-400" 
                              : "bg-emerald-100 text-emerald-700"
                            : order.status === "shipped"
                            ? darkMode 
                              ? "bg-blue-900/30 text-blue-400" 
                              : "bg-blue-100 text-blue-700"
                            : darkMode 
                              ? "bg-amber-900/30 text-amber-400" 
                              : "bg-amber-100 text-amber-700"
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white border-gray-200"
          } shadow-lg`}>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>Coming Soon</h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development
              </p>
            </div>
          </div>
        );
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

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button 
                onClick={() => setActiveTab("cart")}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">Selam Desta</div>
                  <div className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Premium Buyer</div>
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
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setMobileMenuOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
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
                  </motion.button>
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
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className={`fixed md:hidden inset-y-0 left-0 z-50 w-64 border-r ${
                darkMode 
                  ? "bg-gray-900 border-gray-800" 
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-4">
                <div className="space-y-2">
                  {tabs.map(tab => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          activeTab === tab.id
                            ? darkMode
                              ? "bg-gradient-to-r from-amber-900/30 to-orange-900/20 text-amber-400 border border-amber-800/30"
                              : "bg-gradient-to-r from-amber-100 to-orange-50 text-amber-700 border border-amber-200"
                            : darkMode
                              ? "hover:bg-gray-800 text-gray-300"
                              : "hover:bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className={`flex items-center justify-around p-2 ${
          darkMode 
            ? "bg-gray-900/95 border-t border-gray-800" 
            : "bg-white/95 border-t border-gray-200"
        } backdrop-blur-xl`}>
          {tabs.slice(0, 5).map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors flex-1 ${
                  activeTab === tab.id
                    ? darkMode
                      ? "bg-amber-900/30 text-amber-400"
                      : "bg-amber-100 text-amber-700"
                    : darkMode
                      ? "text-gray-400"
                      : "text-gray-600"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}