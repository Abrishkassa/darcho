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
  HelpCircle
} from "lucide-react";

type DashboardData = {
  farmer: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    region: string;
    residence: string;
    farmName: string;
    farmSize: string;
    experience: number;
    certifications: string[];
    joinDate: string;
    rating: number;
    responseTime: string;
  };
  stats: {
    totalProducts: number;
    activeOrders: number;
    monthlyRevenue: number;
    customerRating: number;
    totalOrders: number;
    ordersThisMonth: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  products: {
    id: number;
    name: string;
    grade: string;
    quantity: number;
    price: number;
    status: "available" | "low_stock" | "out_of_stock";
    certifications: string[];
    origin: string;
    altitude: string;
    harvestDate: string;
    description?: string;
  }[];
  orders: {
    id: string;
    buyerName: string;
    productName: string;
    quantity: number;
    totalPrice: number;
    status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
    orderDate: string;
    deliveryStatus: string;
    buyerId: number;
  }[];
  insights: {
    bestSellingProduct: string;
    avgOrderValue: number;
    customerRetention: number;
    stockTurnover: number;
  };
};

export default function FarmerDashboard() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "profile" | "insights">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const { farmer, stats, products, orders, insights } = dashboardData;

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

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.origin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter orders based on status
  const filteredOrders = selectedFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === selectedFilter);

  // Stats for display
  const displayStats = [
    { label: "Total Products", value: stats.totalProducts.toString(), change: "+0", trend: "neutral", icon: Package, color: "blue" },
    { label: "Active Orders", value: stats.activeOrders.toString(), change: "+1", trend: "up", icon: ShoppingBag, color: "emerald" },
    { label: "Monthly Revenue", value: formatCurrency(stats.monthlyRevenue), change: "+15%", trend: "up", icon: DollarSign, color: "amber" },
    { label: "Customer Rating", value: stats.customerRating.toFixed(1), change: "+0.2", trend: "up", icon: Star, color: "purple" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "confirmed":
      case "delivered":
        return "bg-emerald-100 text-emerald-700";
      case "low_stock":
      case "processing":
        return "bg-amber-100 text-amber-700";
      case "shipped":
        case "pending":
        return "bg-blue-100 text-blue-700";
      case "out_of_stock":
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
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
      case "pending":
        return <Truck className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
    { id: "profile", label: "Profile", icon: User },
    { id: "insights", label: "Insights", icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Coffee Products</h1>
                <p className="mt-2 text-gray-600">
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
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button 
                  onClick={() => router.push("/farmer/products/new")}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Add Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      stat.color === "blue" ? "bg-blue-100" :
                      stat.color === "emerald" ? "bg-emerald-100" :
                      stat.color === "amber" ? "bg-amber-100" :
                      "bg-purple-100"
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === "blue" ? "text-blue-600" :
                        stat.color === "emerald" ? "text-emerald-600" :
                        stat.color === "amber" ? "text-amber-600" :
                        "text-purple-600"
                      }`} />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      stat.trend === "up" ? "text-emerald-500" : "text-gray-500"
                    }`}>
                      {stat.trend === "up" && <TrendingUp className="w-4 h-4" />}
                      {stat.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="rounded-xl border border-gray-200 bg-white shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {product.grade} Grade
                          </span>
                          <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(product.status)} flex items-center gap-1`}>
                            {getStatusIcon(product.status)}
                            {product.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-gray-100">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-600">Quantity</div>
                        <div className="font-semibold">{product.quantity} kg</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="font-bold text-amber-500">{formatCurrency(product.price)}/kg</div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-50 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{product.origin}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Mountain className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{product.altitude}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">{formatDate(product.harvestDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {product.certifications.map((cert) => (
                        <span key={cert} className="px-2 py-1 rounded-full text-xs flex items-center gap-1 bg-emerald-100 text-emerald-700">
                          <Shield className="w-3 h-3" />
                          {cert}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Product
                      </button>
                      <button className="px-4 py-2.5 rounded-lg border-2 border-amber-600 text-amber-600 hover:bg-amber-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="px-4 py-2.5 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors">
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-2 text-gray-600">
                  Track and manage all your coffee orders
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="appearance-none pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Order ID</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Buyer</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Product</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Quantity</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Total</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Status</th>
                      <th className="p-4 text-left text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-t border-gray-200">
                        <td className="p-4">
                          <div className="font-mono font-medium text-blue-600">
                            {order.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatDate(order.orderDate)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{order.buyerName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{order.productName}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">{order.quantity} kg</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-amber-500">{formatCurrency(order.totalPrice)}</div>
                        </td>
                        <td className="p-4">
                          <div className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {order.deliveryStatus}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button className="p-2 rounded-lg hover:bg-gray-100">
                              <Eye className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100">
                              <Truck className="w-4 h-4 text-gray-500" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-gray-100">
                              <MessageCircle className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingBag, color: "blue" },
                { label: "This Month", value: stats.ordersThisMonth.toString(), icon: Calendar, color: "emerald" },
                { label: "Pending", value: stats.pendingOrders.toString(), icon: Clock, color: "amber" },
                { label: "Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "purple" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      stat.color === "blue" ? "bg-blue-100" :
                      stat.color === "emerald" ? "bg-emerald-100" :
                      stat.color === "amber" ? "bg-amber-100" :
                      "bg-purple-100"
                    }`}>
                      <stat.icon className={`w-5 h-5 ${
                        stat.color === "blue" ? "text-blue-600" :
                        stat.color === "emerald" ? "text-emerald-600" :
                        stat.color === "amber" ? "text-amber-600" :
                        "text-purple-600"
                      }`} />
                    </div>
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Farmer Profile</h1>
              <p className="mt-2 text-gray-600">
                Manage your account and farm information
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 rounded-xl border border-gray-200 bg-white shadow-lg p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold">
                      {farmer.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="absolute bottom-0 right-0 p-1.5 bg-emerald-500 rounded-full">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-1">{farmer.fullName}</h2>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                            Premium Farmer
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">
                            Verified
                          </span>
                        </div>
                      </div>
                      <button className="mt-4 md:mt-0 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-lg transition-all flex items-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 p-4 rounded-lg bg-gray-50 mb-6">
                      <div>
                        <div className="text-sm text-gray-600">Email</div>
                        <div className="font-medium text-gray-900">{farmer.email}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Phone</div>
                        <div className="font-medium text-gray-900">{farmer.phone}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Region</div>
                        <div className="font-medium text-gray-900">{farmer.region}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Residence</div>
                        <div className="font-medium text-gray-900">{farmer.residence}</div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Farm Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-4 rounded-lg bg-amber-50/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                            <Leaf className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{farmer.farmName}</div>
                            <div className="text-sm text-gray-600">Farm Name</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-green-100 text-green-600">
                            <Mountain className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{farmer.farmSize}</div>
                            <div className="text-sm text-gray-600">Farm Size</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{farmer.experience} years</div>
                            <div className="text-sm text-gray-600">Experience</div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-50/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{formatDate(farmer.joinDate)}</div>
                            <div className="text-sm text-gray-600">Joined Date</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Certifications</h3>
                    <div className="flex flex-wrap gap-2">
                      {farmer.certifications.map((cert) => (
                        <span key={cert} className="px-3 py-2 rounded-lg flex items-center gap-2 bg-emerald-100 text-emerald-700">
                          <Shield className="w-4 h-4" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-gray-200 bg-white shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Farmer Stats</h3>
                <div className="space-y-4">
                  {[
                    { label: "Total Products", value: stats.totalProducts.toString(), icon: Package },
                    { label: "Avg. Rating", value: farmer.rating.toFixed(1), icon: Star },
                    { label: "Active Orders", value: stats.activeOrders.toString(), icon: Users },
                    { label: "Response Time", value: farmer.responseTime, icon: Clock },
                  ].map((stat, index) => (
                    <div key={stat.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <stat.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">{stat.label}</div>
                          <div className="font-bold text-gray-900">{stat.value}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>

                <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-700">
                    <div className="flex items-center gap-3">
                      <Edit className="w-4 h-4" />
                      <span>Update Farm Info</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-700">
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4" />
                      <span>Add New Product</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full p-3 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors text-gray-700">
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
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Business Insights</h1>
              <p className="mt-2 text-gray-600">
                Analytics and performance metrics for your coffee business
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Best Selling Product", value: insights.bestSellingProduct, change: "+24%", icon: TrendingUp },
                { label: "Avg. Order Value", value: formatCurrency(insights.avgOrderValue), change: "+8%", icon: DollarSign },
                { label: "Customer Retention", value: `${insights.customerRetention}%`, change: "+5%", icon: Users },
                { label: "Stock Turnover", value: `${insights.stockTurnover}x`, change: "+0.4", icon: Package },
              ].map((insight, index) => (
                <motion.div
                  key={insight.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 rounded-lg bg-amber-100">
                      <insight.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex items-center gap-1 text-sm text-emerald-500">
                      <TrendingUp className="w-4 h-4" />
                      {insight.change}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{insight.value}</div>
                  <div className="text-sm text-gray-600">{insight.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-gray-200 bg-white shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Performance</h3>
                <div className="h-48 rounded-lg flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-600">Sales chart visualization</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-xl border border-gray-200 bg-white shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-6">Product Performance</h3>
                <div className="h-48 rounded-lg flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-600">Product analytics chart</div>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-gray-200 bg-white shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-6">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50">
                  <Zap className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Increase {insights.bestSellingProduct} Stock</div>
                    <div className="text-sm text-gray-600">
                      Based on sales trends, increasing {insights.bestSellingProduct} inventory could increase revenue by 15%.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50">
                  <Sparkles className="w-5 h-5 text-emerald-500 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Optimize Pricing Strategy</div>
                    <div className="text-sm text-gray-600">
                      Consider adjusting prices based on market demand analysis to maximize profits.
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
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
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                <Settings className="w-5 h-5" />
              </button>
              <div className="relative group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold cursor-pointer">
                  {farmer.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{farmer.fullName}</div>
                    <div className="text-sm text-gray-600">{farmer.email}</div>
                  </div>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  <button 
                    onClick={() => {
                      // Implement sign out logic
                      router.push("/login");
                    }}
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
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {farmer.fullName.split(' ')[0]}!</h1>
              <p className="text-gray-600 mt-1">
                Here's what's happening with your coffee business today
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

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