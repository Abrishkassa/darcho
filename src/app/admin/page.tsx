"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  Home,
  Bell,
  Search,
  Filter,
  Download,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Percent,
  Activity,
  Coffee,
  Shield,
  Globe,
  UserCheck,
  BarChart,
  PieChart,
  LineChart,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  LogOut,
  User,
  Database,
  Lock,
  BellRing,
  RefreshCw,
  Zap
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "products" | "orders" | "analytics" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const stats = [
    { label: "Total Revenue", value: "₮ 2.5M", change: "+12.5%", trend: "up", icon: DollarSign, color: "emerald" },
    { label: "Active Users", value: "8,452", change: "+8.2%", trend: "up", icon: Users, color: "blue" },
    { label: "Total Products", value: "1,245", change: "+3.1%", trend: "up", icon: Package, color: "amber" },
    { label: "Pending Orders", value: "124", change: "-2.3%", trend: "down", icon: ShoppingCart, color: "purple" },
    { label: "Conversion Rate", value: "4.8%", change: "+1.2%", trend: "up", icon: Percent, color: "pink" },
    { label: "Avg. Order Value", value: "₮ 2,450", change: "+5.6%", trend: "up", icon: Activity, color: "indigo" },
  ];

  const recentUsers = [
    { id: 1, name: "Abriham Kassa", email: "abriham@darcho.com", role: "Farmer", status: "active", joinDate: "2024-01-15" },
    { id: 2, name: "Selam Desta", email: "selam@buyer.com", role: "Buyer", status: "active", joinDate: "2024-01-14" },
    { id: 3, name: "Mikael Assefa", email: "mikael@farmer.com", role: "Farmer", status: "pending", joinDate: "2024-01-13" },
    { id: 4, name: "Helen Tesfaye", email: "helen@exporter.com", role: "Exporter", status: "active", joinDate: "2024-01-12" },
    { id: 5, name: "Daniel Solomon", email: "daniel@buyer.com", role: "Buyer", status: "inactive", joinDate: "2024-01-11" },
  ];

  const recentOrders = [
    { id: "ORD-1001", customer: "Selam Desta", product: "Arabica Coffee", amount: "₮ 45,000", status: "completed", date: "2024-01-15" },
    { id: "ORD-1002", customer: "Global Exports", product: "Organic Coffee", amount: "₮ 128,000", status: "processing", date: "2024-01-14" },
    { id: "ORD-1003", customer: "Cafe Addis", product: "Sidamo Blend", amount: "₮ 67,500", status: "pending", date: "2024-01-13" },
    { id: "ORD-1004", customer: "Bean Traders", product: "Yirgacheffe", amount: "₮ 92,000", status: "completed", date: "2024-01-12" },
    { id: "ORD-1005", customer: "Morning Roast", product: "Harar Coffee", amount: "₮ 33,800", status: "failed", date: "2024-01-11" },
  ];

  const topProducts = [
    { name: "Arabica Premium", category: "Coffee", sales: 245, revenue: "₮ 245,000", rating: 4.8 },
    { name: "Yirgacheffe AA", category: "Coffee", sales: 189, revenue: "₮ 189,500", rating: 4.9 },
    { name: "Organic Sidamo", category: "Coffee", sales: 167, revenue: "₮ 167,800", rating: 4.7 },
    { name: "Harar Longberry", category: "Coffee", sales: 142, revenue: "₮ 142,000", rating: 4.6 },
    { name: "Limu Coffee", category: "Coffee", sales: 128, revenue: "₮ 128,500", rating: 4.5 },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "users", label: "Users", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
      case "processing":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "failed":
      case "inactive":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "processing":
        return <RefreshCw className="w-4 h-4" />;
      case "failed":
      case "inactive":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-2xl backdrop-blur-sm border ${
                    darkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200"
                  } shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">Revenue Overview</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <LineChart className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <BarChart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <div className="relative w-full">
                    {/* Mock Chart */}
                    <div className="flex items-end justify-between h-48 px-4">
                      {[40, 65, 85, 60, 90, 75, 100].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: i * 0.1, duration: 0.5 }}
                          className="w-8 bg-gradient-to-t from-amber-500 to-orange-500 rounded-t-lg"
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-sm text-gray-500">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Activity */}
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">User Activity</h3>
                  <button className="px-3 py-1.5 text-sm rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                    This Week
                  </button>
                </div>
                <div className="space-y-4">
                  {["Farmers", "Buyers", "Exporters", "Admins"].map((role, i) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{role}</div>
                          <div className="text-sm text-gray-500">{[245, 189, 67, 12][i]} active</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{[`+${[15, 22, 8, 0][i]}%`]}</div>
                        <div className="text-sm text-gray-500">growth</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Data */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className={`rounded-2xl backdrop-blur-sm border overflow-hidden ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Orders</h3>
                    <button className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={`${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
                      <tr>
                        <th className="p-4 text-left text-sm font-medium">Order ID</th>
                        <th className="p-4 text-left text-sm font-medium">Customer</th>
                        <th className="p-4 text-left text-sm font-medium">Amount</th>
                        <th className="p-4 text-left text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{order.id}</div>
                            <div className="text-sm text-gray-500">{order.date}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium">{order.customer}</div>
                            <div className="text-sm text-gray-500">{order.product}</div>
                          </td>
                          <td className="p-4 font-semibold">{order.amount}</td>
                          <td className="p-4">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                              {getStatusIcon(order.status)}
                              {order.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Products */}
              <div className={`rounded-2xl backdrop-blur-sm border overflow-hidden ${
                darkMode 
                  ? "bg-gray-800/50 border-gray-700" 
                  : "bg-white border-gray-200"
              } shadow-lg`}>
                <div className="p-6 border-b dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Top Products</h3>
                    <button className="text-sm text-amber-600 dark:text-amber-400 hover:underline">
                      View All
                    </button>
                  </div>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                            <Coffee className="w-5 h-5 text-white" />
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{index + 1}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{product.revenue}</div>
                        <div className="text-sm text-gray-500">{product.sales} sales</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            {/* Users Header */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">User Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage all users in the platform</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg border ${
                        darkMode 
                          ? "bg-gray-800 border-gray-700 text-white" 
                          : "bg-white border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Add User
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className={`rounded-2xl backdrop-blur-sm border overflow-hidden ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className="p-4 text-left text-sm font-medium">User</th>
                      <th className="p-4 text-left text-sm font-medium">Role</th>
                      <th className="p-4 text-left text-sm font-medium">Status</th>
                      <th className="p-4 text-left text-sm font-medium">Join Date</th>
                      <th className="p-4 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                              <span className="font-bold text-white">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                            user.role === "Farmer" 
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                              : user.role === "Buyer"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                          }`}>
                            {user.role}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            {user.status}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {user.joinDate}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="View">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Edit">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-500" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      // Similar structure for other tabs...
      default:
        return (
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white border-gray-200"
          } shadow-lg`}>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Coming Soon</h3>
              <p className="text-gray-600 dark:text-gray-400">
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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-gray-300" 
                    : "hover:bg-gray-100 text-gray-600"
                } transition-colors`}
              >
                {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, Administrator
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${
                  darkMode 
                    ? "hover:bg-gray-800 text-amber-400" 
                    : "hover:bg-gray-100 text-amber-600"
                } transition-colors`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Admin Profile */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <span className="font-bold text-white">A</span>
                </div>
                <div className="hidden md:block">
                  <div className="font-medium">Admin User</div>
                  <div className="text-xs text-gray-500">Super Admin</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? 280 : 80 }}
          className={`sticky top-16 h-[calc(100vh-4rem)] border-r ${
            darkMode 
              ? "bg-gray-900/50 border-gray-800" 
              : "bg-white/50 border-gray-200"
          } backdrop-blur-sm transition-all duration-300 overflow-hidden`}
        >
          <div className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
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
                  </button>
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
                    <Lock className="w-5 h-5" />
                    <span>Security</span>
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {activeTab === "overview" && "Welcome to your dashboard. Here's what's happening with your store today."}
                    {activeTab === "users" && "Manage user accounts, roles, and permissions"}
                    {activeTab === "products" && "View and manage all products in your marketplace"}
                    {activeTab === "orders" && "Track and process all orders from customers"}
                    {activeTab === "analytics" && "Detailed analytics and performance metrics"}
                    {activeTab === "settings" && "Configure your marketplace settings"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Quick Action
                  </button>
                </div>
              </div>

              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Bottom Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 p-2">
        <div className="grid grid-cols-4 gap-1">
          {tabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
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