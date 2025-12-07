"use client";

import { useState } from "react";
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
  MessageCircle
} from "lucide-react";

export default function FarmerPortal() {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "profile" | "insights">("products");
  const [darkMode, setDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock data
  const stats = [
    { label: "Total Products", value: "8", change: "+2", trend: "up", icon: Package, color: "blue" },
    { label: "Active Orders", value: "5", change: "+1", trend: "up", icon: ShoppingBag, color: "emerald" },
    { label: "Monthly Revenue", value: "₮ 42,500", change: "+15%", trend: "up", icon: DollarSign, color: "amber" },
    { label: "Customer Rating", value: "4.8", change: "+0.2", trend: "up", icon: Star, color: "purple" },
  ];

  const products = [
    {
      id: 1,
      name: "Yirgacheffe AA Premium",
      grade: "AA",
      quantity: "45 kg",
      price: "₮ 2,800/kg",
      status: "available",
      certification: ["Organic", "Fair Trade"],
      origin: "Yirgacheffe, Ethiopia",
      altitude: "2100m",
      harvestDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Sidamo Natural Process",
      grade: "A",
      quantity: "32 kg",
      price: "₮ 2,400/kg",
      status: "available",
      certification: ["Organic"],
      origin: "Sidamo, Ethiopia",
      altitude: "1900m",
      harvestDate: "2024-01-10"
    },
    {
      id: 3,
      name: "Harar Longberry",
      grade: "Longberry",
      quantity: "28 kg",
      price: "₮ 3,200/kg",
      status: "low_stock",
      certification: ["Fair Trade", "Rainforest Alliance"],
      origin: "Harar, Ethiopia",
      altitude: "1800m",
      harvestDate: "2024-01-05"
    },
    {
      id: 4,
      name: "Limu Washed",
      grade: "B",
      quantity: "52 kg",
      price: "₮ 2,600/kg",
      status: "available",
      certification: ["Organic", "Bird Friendly"],
      origin: "Limu, Ethiopia",
      altitude: "2000m",
      harvestDate: "2024-01-20"
    },
  ];

  const orders = [
    {
      id: "ORD-2024-001",
      buyer: "Selam Desta",
      product: "Yirgacheffe AA",
      quantity: "10 kg",
      total: "₮ 28,000",
      status: "confirmed",
      date: "2024-01-15",
      delivery: "Pending"
    },
    {
      id: "ORD-2024-002",
      buyer: "Global Exports",
      product: "Sidamo Natural",
      quantity: "25 kg",
      total: "₮ 60,000",
      status: "processing",
      date: "2024-01-14",
      delivery: "Scheduled"
    },
    {
      id: "ORD-2024-003",
      buyer: "Cafe Addis",
      product: "Harar Longberry",
      quantity: "8 kg",
      total: "₮ 25,600",
      status: "shipped",
      date: "2024-01-13",
      delivery: "In Transit"
    },
    {
      id: "ORD-2024-004",
      buyer: "Bean Traders",
      product: "Limu Washed",
      quantity: "15 kg",
      total: "₮ 39,000",
      status: "delivered",
      date: "2024-01-12",
      delivery: "Completed"
    },
  ];

  const insights = [
    { label: "Best Selling Product", value: "Yirgacheffe AA", change: "+24%", icon: TrendingUp },
    { label: "Avg. Order Value", value: "₮ 38,150", change: "+8%", icon: DollarSign },
    { label: "Customer Retention", value: "92%", change: "+5%", icon: Users },
    { label: "Stock Turnover", value: "3.2x", change: "+0.4", icon: Package },
  ];

  const farmerProfile = {
    name: "Abriham Kassa",
    phone: "+251 912 345 678",
    email: "abriham@greenvalleyfarm.com",
    region: "Oromia",
    residence: "Addis Ababa",
    farmName: "Green Valley Farm",
    farmSize: "5 hectares",
    experience: "8 years",
    certification: ["Organic Certified", "Fair Trade", "Rainforest Alliance"],
    joinDate: "2022-03-15"
  };

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "profile", label: "Profile", icon: User },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "confirmed":
      case "delivered":
        return darkMode 
          ? "bg-emerald-900/30 text-emerald-400" 
          : "bg-emerald-100 text-emerald-700";
      case "low_stock":
      case "processing":
        return darkMode 
          ? "bg-amber-900/30 text-amber-400" 
          : "bg-amber-100 text-amber-700";
      case "shipped":
        return darkMode 
          ? "bg-blue-900/30 text-blue-400" 
          : "bg-blue-100 text-blue-700";
      default:
        return darkMode 
          ? "bg-gray-800 text-gray-400" 
          : "bg-gray-100 text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
      case "confirmed":
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "low_stock":
      case "processing":
        return <Clock className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getColorClasses = (color: string, isDark: boolean, isIcon = false) => {
    switch (color) {
      case "blue":
        return isIcon 
          ? (isDark ? "text-blue-400" : "text-blue-600")
          : (isDark ? "bg-blue-900/30" : "bg-blue-100");
      case "emerald":
        return isIcon 
          ? (isDark ? "text-emerald-400" : "text-emerald-600")
          : (isDark ? "bg-emerald-900/30" : "bg-emerald-100");
      case "amber":
        return isIcon 
          ? (isDark ? "text-amber-400" : "text-amber-600")
          : (isDark ? "bg-amber-900/30" : "bg-amber-100");
      case "purple":
        return isIcon 
          ? (isDark ? "text-purple-400" : "text-purple-600")
          : (isDark ? "bg-purple-900/30" : "bg-purple-100");
      default:
        return isIcon 
          ? (isDark ? "text-gray-400" : "text-gray-600")
          : (isDark ? "bg-gray-800" : "bg-gray-100");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Your Coffee Products</h1>
                <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Manage your coffee listings and inventory
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
                    className={`pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  />
                </div>
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg transition-all flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200"
                  } shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(stat.color, darkMode, false)}`}>
                      <stat.icon className={`w-5 h-5 ${getColorClasses(stat.color, darkMode, true)}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                    }`}>
                      {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className={`rounded-xl border overflow-hidden ${
                    darkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-200"
                  } shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className={`font-bold text-xl mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            darkMode 
                              ? "bg-amber-900/30 text-amber-400" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {product.grade} Grade
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)} flex items-center gap-1`}>
                            {getStatusIcon(product.status)}
                            {product.status === "low_stock" ? "Low Stock" : "Available"}
                          </div>
                        </div>
                      </div>
                      <button className={`p-2 rounded-lg ${
                        darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}>
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Quantity</div>
                        <div className="font-semibold">{product.quantity}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Price</div>
                        <div className="font-bold text-amber-500">{product.price}</div>
                      </div>
                    </div>

                    {/* Origin Details */}
                    <div className={`p-3 rounded-lg mb-4 ${
                      darkMode ? "bg-gray-800/30" : "bg-gray-50"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                          {product.origin}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Mountain className="w-4 h-4" />
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                            {product.altitude}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                            {product.harvestDate}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <div className="flex flex-wrap gap-2 mb-5">
                      {product.certification.map((cert) => (
                        <span key={cert} className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                          darkMode 
                            ? "bg-emerald-900/30 text-emerald-400" 
                            : "bg-emerald-100 text-emerald-700"
                        }`}>
                          <Shield className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Product
                      </button>
                      <button className="px-4 py-2.5 rounded-lg border-2 border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
                <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Track and manage all your coffee orders
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className={`appearance-none pl-10 pr-4 py-2 rounded-lg border ${
                      darkMode 
                        ? "bg-gray-800 border-gray-700 text-white" 
                        : "bg-white border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className={`rounded-xl border overflow-hidden ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white border-gray-200"
            } shadow-lg`}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`${darkMode ? "bg-gray-900/50" : "bg-gray-50"}`}>
                    <tr>
                      <th className="p-4 text-left text-sm font-medium">Order ID</th>
                      <th className="p-4 text-left text-sm font-medium">Buyer</th>
                      <th className="p-4 text-left text-sm font-medium">Product</th>
                      <th className="p-4 text-left text-sm font-medium">Quantity</th>
                      <th className="p-4 text-left text-sm font-medium">Total</th>
                      <th className="p-4 text-left text-sm font-medium">Status</th>
                      <th className="p-4 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className={`border-t ${darkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <td className="p-4">
                          <div className={`font-mono font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                            {order.id}
                          </div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {order.date}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.buyer}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.product}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{order.quantity}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-amber-500">{order.total}</div>
                        </td>
                        <td className="p-4">
                          <div className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                          <div className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {order.delivery}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                              <Truck className="w-4 h-4" />
                            </button>
                            <button className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}>
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: "24", icon: ShoppingBag, color: "blue" },
                { label: "This Month", value: "5", icon: Calendar, color: "emerald" },
                { label: "Pending", value: "2", icon: Clock, color: "amber" },
                { label: "Revenue", value: "₮ 152,600", icon: DollarSign, color: "purple" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${getColorClasses(stat.color, darkMode, false)}`}>
                      <stat.icon className={`w-5 h-5 ${getColorClasses(stat.color, darkMode, true)}`} />
                    </div>
                    <div className="text-lg font-bold">{stat.value}</div>
                  </div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Farmer Profile</h1>
              <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Manage your account and farm information
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`lg:col-span-2 rounded-xl border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                      AK
                    </div>
                    <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{farmerProfile.name}</h2>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"}`}>
                            Premium Farmer
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                            Verified
                          </span>
                        </div>
                      </div>
                      <button className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>

                    {/* Contact Info */}
                    <div className={`grid md:grid-cols-2 gap-4 p-4 rounded-lg mb-6 ${darkMode ? "bg-gray-800/30" : "bg-gray-50"}`}>
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</div>
                        <div className="font-medium">{farmerProfile.email}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Phone</div>
                        <div className="font-medium">{farmerProfile.phone}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Region</div>
                        <div className="font-medium">{farmerProfile.region}</div>
                      </div>
                      <div>
                        <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Residence</div>
                        <div className="font-medium">{farmerProfile.residence}</div>
                      </div>
                    </div>

                    {/* Farm Details */}
                    <h3 className="text-lg font-bold mb-4">Farm Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/30" : "bg-amber-50/50"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold">{farmerProfile.farmName}</div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Farm Name</div>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/30" : "bg-green-50/50"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Mountain className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold">{farmerProfile.farmSize}</div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Farm Size</div>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/30" : "bg-blue-50/50"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold">{farmerProfile.experience}</div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Experience</div>
                          </div>
                        </div>
                      </div>
                      <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800/30" : "bg-purple-50/50"}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold">{farmerProfile.joinDate}</div>
                            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Joined Date</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Certifications */}
                    <h3 className="text-lg font-bold mt-6 mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {farmerProfile.certification.map((cert) => (
                        <span key={cert} className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                          darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          <Shield className="w-4 h-4" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stats Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
              >
                <h3 className="text-lg font-bold mb-6">Farmer Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: "Total Harvests", value: "48", icon: Package },
                    { label: "Avg. Rating", value: "4.8", icon: Star },
                    { label: "Repeat Customers", value: "18", icon: Users },
                    { label: "Response Time", value: "< 2h", icon: Clock },
                  ].map((stat, index) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{stat.label}</div>
                          <div className="font-bold">{stat.value}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <h3 className="text-lg font-bold mt-8 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className={`w-full p-3 rounded-lg flex items-center justify-between ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Edit className="w-4 h-4" />
                      <span>Update Farm Info</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className={`w-full p-3 rounded-lg flex items-center justify-between ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>Add New Product</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className={`w-full p-3 rounded-lg flex items-center justify-between ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-50"} transition-colors`}>
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-4 h-4" />
                      <span>View Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        );

      case "insights":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Business Insights</h1>
              <p className={`mt-2 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Analytics and performance metrics for your coffee business
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-5 rounded-xl border ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${darkMode ? "bg-amber-900/30" : "bg-amber-100"}`}>
                      <insight.icon className={`w-5 h-5 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                      {insight.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">{insight.value}</div>
                  <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{insight.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Charts Placeholder */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
              >
                <h3 className="text-lg font-bold mb-6">Sales Performance</h3>
                <div className={`h-48 rounded-lg flex items-center justify-center ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}>
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Sales chart visualization</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
              >
                <h3 className="text-lg font-bold mb-6">Product Performance</h3>
                <div className={`h-48 rounded-lg flex items-center justify-center ${darkMode ? "bg-gray-800/30" : "bg-gray-100"}`}>
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Product analytics chart</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-xl border p-6 ${darkMode ? "bg-gray-800/50 border-gray-700" : "bg-white border-gray-200"} shadow-lg`}
            >
              <h3 className="text-lg font-bold mb-6">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20">
                  <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Increase Yirgacheffe AA Stock</div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Based on sales trends, increasing Yirgacheffe AA inventory by 20% could increase revenue by 15%.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                  <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Optimize Pricing Strategy</div>
                    <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Consider adjusting Harar Longberry price to ₮ 3,400/kg based on market demand analysis.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen ${themeClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b ${darkMode ? "bg-gray-900/95 border-gray-800" : "bg-white/95 border-gray-200"} backdrop-blur-sm`}>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className={`w-8 h-8 ${darkMode ? "text-amber-400" : "text-amber-600"}`} />
              <span className="text-xl font-bold">CoffeeConnect</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${darkMode ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
                Farmer Portal
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                {darkMode ? "🌙" : "☀️"}
              </button>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? darkMode
                    ? "bg-amber-600 text-white"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                  : darkMode
                    ? "text-gray-400 hover:bg-gray-800 hover:text-white"
                    : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
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

      {/* Footer */}
      <footer className={`mt-8 py-6 border-t ${darkMode ? "border-gray-800" : "border-gray-200"}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              © 2024 CoffeeConnect. Empowering Ethiopian coffee farmers.
            </div>
            <div className="flex items-center gap-4">
              <button className={`text-sm ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                Support
              </button>
              <button className={`text-sm ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                Privacy
              </button>
              <button className={`text-sm ${darkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}>
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}