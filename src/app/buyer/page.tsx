"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Heart, 
  Eye, 
  Star, 
  Coffee,
  User,
  MapPin,
  Check,
  Package,
  Truck,
  CheckCircle,
  MessageCircle,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Sun,
  Moon,
  Bell,
  Package as PackageIcon,
  TrendingUp as TrendingUpIcon
} from "lucide-react";

export default function BuyerPortal() {
  const [activeTab, setActiveTab] = useState<"products" | "cart" | "orders" | "profile" | "favorites" | "chats">("products");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cartItems, setCartItems] = useState(3);
  const [favorites, setFavorites] = useState([1, 3]);
  const [sortBy, setSortBy] = useState("featured");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(5);

  // Mock products data
  const products = [
    {
      id: 1,
      name: "Yirgacheffe AA Premium",
      farmer: "Abriham Kassa",
      origin: "Yirgacheffe, Ethiopia",
      price: "ETB 2,800",
      unit: "kg",
      rating: 4.9,
      reviews: 124,
      quantity: 45,
      grade: "AA",
      certification: ["Organic", "Fair Trade"],
      description: "Floral and citrus notes with a clean finish. Grown at 2100m altitude.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Sidamo Natural Process",
      farmer: "Selam Desta",
      origin: "Sidamo, Ethiopia",
      price: "ETB 2,400",
      unit: "kg",
      rating: 4.7,
      reviews: 89,
      quantity: 32,
      grade: "A",
      certification: ["Organic"],
      description: "Fruity and winey notes with a bold body. Sun-dried natural process.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Harar Longberry",
      farmer: "Mikael Assefa",
      origin: "Harar, Ethiopia",
      price: "ETB 3,200",
      unit: "kg",
      rating: 4.8,
      reviews: 167,
      quantity: 28,
      grade: "Longberry",
      certification: ["Fair Trade", "Rainforest Alliance"],
      description: "Complex blueberry and mocha notes with earthy undertones.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Limu Washed",
      farmer: "Helen Tesfaye",
      origin: "Limu, Ethiopia",
      price: "ETB 2,600",
      unit: "kg",
      rating: 4.6,
      reviews: 76,
      quantity: 52,
      grade: "B",
      certification: ["Organic", "Bird Friendly"],
      description: "Balanced with notes of spice and berries. Fully washed process.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
    {
      id: 5,
      name: "Guij Coffee Beans",
      farmer: "Daniel Solomon",
      origin: "Guij, Ethiopia",
      price: "ETB 2,900",
      unit: "kg",
      rating: 4.5,
      reviews: 63,
      quantity: 38,
      grade: "AA",
      certification: ["Organic", "UTZ"],
      description: "Chocolate and nutty flavors with a smooth finish.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      name: "Kochere Natural",
      farmer: "Ruth Bekele",
      origin: "Kochere, Ethiopia",
      price: "ETB 3,000",
      unit: "kg",
      rating: 4.9,
      reviews: 142,
      quantity: 24,
      grade: "A",
      certification: ["Organic", "Fair Trade"],
      description: "Sweet and complex with tropical fruit notes.",
      image: "https://images.unsplash.com/photo-1587734195507-6f5dad1449e9?w=400&h=300&fit=crop"
    },
  ];

  const categories = [
    { id: "all", label: "All Products", count: products.length },
    { id: "premium", label: "Premium AA", count: 2 },
    { id: "organic", label: "Organic", count: 4 },
    { id: "fairtrade", label: "Fair Trade", count: 3 },
    { id: "limited", label: "Limited Stock", count: 1 },
    { id: "best", label: "Best Sellers", count: 3 },
  ];

  const sortOptions = [
    { id: "featured", label: "Featured" },
    { id: "price-low", label: "Price: Low to High" },
    { id: "price-high", label: "Price: High to Low" },
    { id: "rating", label: "Highest Rated" },
    { id: "newest", label: "Newest" },
  ];

  const tabs = [
    { id: "products", label: "Products", icon: PackageIcon },
    { id: "cart", label: "Cart", icon: ShoppingCart },
    { id: "orders", label: "Orders", icon: Truck },
    { id: "profile", label: "Profile", icon: User },
    { id: "favorites", label: "Favorites", icon: Heart },
    { id: "chats", label: "Chats", icon: MessageCircle },
  ];

  const cartProducts = [
    { id: 1, name: "Yirgacheffe AA", farmer: "Abriham", quantity: 10, price: "ETB 28,000", unit: "kg" },
    { id: 2, name: "Sidamo Natural", farmer: "Selam", quantity: 5, price: "ETB 12,000", unit: "kg" },
    { id: 3, name: "Harar Longberry", farmer: "Mikael", quantity: 3, price: "ETB 9,600", unit: "kg" },
  ];

  const orders = [
    { id: "ORD-2024-001", date: "Jan 15, 2024", items: 2, total: "ETB 40,000", status: "delivered" },
    { id: "ORD-2024-002", date: "Jan 12, 2024", items: 1, total: "ETB 28,000", status: "shipped" },
    { id: "ORD-2024-003", date: "Jan 10, 2024", items: 3, total: "ETB 67,500", status: "processing" },
    { id: "ORD-2024-004", date: "Jan 8, 2024", items: 2, total: "ETB 52,000", status: "delivered" },
  ];

  const themeClass = darkMode 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  const renderTabContent = () => {
    switch (activeTab) {
      case "products":
        return (
          <div className="space-y-6">
            {/* Hero Section */}
            <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 p-8 text-white relative">
              <div className="absolute inset-0 bg-black/20" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Coffee className="w-8 h-8" />
                  <Sparkles className="w-6 h-6" />
                  <span className="text-amber-100 font-semibold">Ethiopia's Finest</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">Discover Premium Ethiopian Coffee</h1>
                <p className="text-amber-100 max-w-2xl">
                  Direct from farmers. Verified quality. Transparent pricing. Experience the authentic taste of Ethiopia's coffee regions.
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white/80 border-gray-200"
            } shadow-lg`}>
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-xl">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search coffee by region, grade, or farmer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      darkMode 
                        ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className={`appearance-none pl-4 pr-10 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        darkMode 
                          ? "bg-gray-800 border-gray-700 text-white" 
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>{option.label}</option>
                      ))}
                    </select>
                    <Filter className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      darkMode ? "text-gray-400" : "text-gray-400"
                    } pointer-events-none`} />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mt-6">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg"
                        : darkMode
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{category.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.id
                        ? "bg-white/20"
                        : darkMode
                          ? "bg-gray-700"
                          : "bg-gray-300"
                    }`}>
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className={`rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border ${
                    darkMode 
                      ? "bg-gray-800/50 border-gray-700" 
                      : "bg-white border-gray-100"
                  }`}>
                    {/* Product Image */}
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      
                      {/* Favorite Button */}
                      <button
                        onClick={() => {
                          if (favorites.includes(product.id)) {
                            setFavorites(favorites.filter(id => id !== product.id));
                          } else {
                            setFavorites([...favorites, product.id]);
                          }
                        }}
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-colors ${
                          darkMode 
                            ? "bg-gray-800/80 hover:bg-gray-700" 
                            : "bg-white/90 hover:bg-white"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${
                          favorites.includes(product.id) 
                            ? "fill-red-500 text-red-500" 
                            : darkMode 
                              ? "text-gray-400" 
                              : "text-gray-600"
                        }`} />
                      </button>

                      {/* Grade Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full backdrop-blur-sm text-sm font-semibold ${
                        darkMode ? "bg-gray-800/80" : "bg-white/90"
                      }`}>
                        {product.grade} Grade
                      </div>

                      {/* Quantity Badge */}
                      <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/70 text-white text-sm">
                        {product.quantity} kg available
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className={`font-bold text-xl mb-1 ${
                            darkMode ? "text-white" : "text-gray-900"
                          }`}>
                            {product.name}
                          </h3>
                          <div className={`flex items-center gap-2 text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}>
                            <User className="w-4 h-4" />
                            <span>{product.farmer}</span>
                            <MapPin className="w-4 h-4 ml-2" />
                            <span>{product.origin}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-amber-500">{product.price}</div>
                          <div className={`text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}>
                            per {product.unit}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${
                              i < Math.floor(product.rating) 
                                ? "fill-amber-400 text-amber-400" 
                                : darkMode 
                                  ? "text-gray-700" 
                                  : "text-gray-300"
                            }`} />
                          ))}
                        </div>
                        <span className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-600"
                        }`}>
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>

                      {/* Certifications */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {product.certification.map(cert => (
                          <span key={cert} className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                            darkMode 
                              ? "bg-emerald-900/30 text-emerald-400" 
                              : "bg-green-100 text-green-700"
                          }`}>
                            <Check className="w-3 h-3" />
                            {cert}
                          </span>
                        ))}
                      </div>

                      {/* Description */}
                      <p className={`text-sm mb-4 line-clamp-2 ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}>
                        {product.description}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setCartItems(cartItems + 1);
                            setActiveTab("cart");
                          }}
                          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => console.log("View details", product.id)}
                          className={`px-4 py-3 rounded-xl border-2 transition-colors ${
                            darkMode 
                              ? "border-amber-500 text-amber-500 hover:bg-amber-900/20" 
                              : "border-amber-600 text-amber-600 hover:bg-amber-50"
                          }`}
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setActiveTab("chats")}
                          className={`px-4 py-3 rounded-xl border-2 transition-colors ${
                            darkMode 
                              ? "border-blue-500 text-blue-500 hover:bg-blue-900/20" 
                              : "border-blue-600 text-blue-600 hover:bg-blue-50"
                          }`}
                          title="Chat with Farmer"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "cart":
        return (
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white/80 border-gray-200"
            } shadow-lg`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Your Shopping Cart
                  </h2>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    {cartProducts.length} items in cart
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-amber-500">ETB 49,600</div>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Total amount</p>
                </div>
              </div>

              <div className="space-y-4">
                {cartProducts.map(item => (
                  <div key={item.id} className={`flex items-center justify-between p-4 rounded-xl border hover:shadow-md transition-shadow ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {item.name}
                        </h4>
                        <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                          Farmer: {item.farmer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-amber-500">{item.price}</div>
                        <div className={darkMode ? "text-gray-400" : "text-gray-600"}>
                          {item.quantity} {item.unit}
                        </div>
                      </div>
                      <button 
                        onClick={() => setCartItems(Math.max(0, cartItems - 1))}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`mt-8 pt-6 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}>
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                        Secure checkout • Buyer protection • 24/7 support
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setActiveTab("products")}
                      className={`px-6 py-3 rounded-xl border-2 transition-colors ${
                        darkMode 
                          ? "border-amber-500 text-amber-500 hover:bg-amber-900/20" 
                          : "border-amber-600 text-amber-600 hover:bg-amber-50"
                      }`}
                    >
                      Continue Shopping
                    </button>
                    <button className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Proceed to Checkout
                    </button>
                  </div>
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
                : "bg-white/80 border-gray-200"
            } shadow-lg`}>
              <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Order History
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Orders", value: "24", icon: PackageIcon, color: "blue" },
                  { label: "Delivered", value: "18", icon: CheckCircle, color: "emerald" },
                  { label: "In Transit", value: "3", icon: Truck, color: "amber" },
                  { label: "Processing", value: "3", icon: TrendingUpIcon, color: "purple" },
                ].map(stat => (
                  <div key={stat.label} className={`p-4 rounded-xl border shadow-sm ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        darkMode 
                          ? `bg-${stat.color}-900/30` 
                          : `bg-${stat.color}-100`
                      }`}>
                        <stat.icon className={`w-5 h-5 ${
                          darkMode 
                            ? `text-${stat.color}-400` 
                            : `text-${stat.color}-600`
                        }`} />
                      </div>
                      <div>
                        <div className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                          {stat.value}
                        </div>
                        <div className={darkMode ? "text-gray-400" : "text-gray-600"}>
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className={`p-4 rounded-xl border hover:shadow-md transition-shadow ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700 hover:bg-gray-800/50" 
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
                            {order.id}
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm ${
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
                        <div className={darkMode ? "text-gray-400" : "text-gray-600"}>
                          Ordered on {order.date} • {order.items} items
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-amber-500">{order.total}</div>
                        <button className={`mt-2 text-sm flex items-center gap-1 ${
                          darkMode ? "text-amber-400 hover:text-amber-300" : "text-amber-600 hover:text-amber-700"
                        }`}>
                          Track Order <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case "profile":
        return (
          <div className="max-w-4xl mx-auto">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              darkMode 
                ? "bg-gray-800/50 border-gray-700" 
                : "bg-white/80 border-gray-200"
            } shadow-lg`}>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Selam Desta
                  </h2>
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Coffee Buyer & Exporter</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={darkMode ? "text-gray-400" : "text-gray-500"}>⭐ 4.8 Buyer Rating</span>
                    <span className={darkMode ? "text-gray-400" : "text-gray-500"}>📦 24 Orders</span>
                    <span className={darkMode ? "text-gray-400" : "text-gray-500"}>👑 Premium Member</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Full Name</label>
                        <input className={`w-full p-2 rounded-lg border mt-1 ${
                          darkMode 
                            ? "bg-gray-800 border-gray-700 text-white" 
                            : "bg-white border-gray-300"
                        }`} defaultValue="Selam Desta" />
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Email</label>
                        <input className={`w-full p-2 rounded-lg border mt-1 ${
                          darkMode 
                            ? "bg-gray-800 border-gray-700 text-white" 
                            : "bg-white border-gray-300"
                        }`} defaultValue="selam@darcho.com" />
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Phone</label>
                        <input className={`w-full p-2 rounded-lg border mt-1 ${
                          darkMode 
                            ? "bg-gray-800 border-gray-700 text-white" 
                            : "bg-white border-gray-300"
                        }`} defaultValue="+251 91 234 5678" />
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Street Address</label>
                        <input className={`w-full p-2 rounded-lg border mt-1 ${
                          darkMode 
                            ? "bg-gray-800 border-gray-700 text-white" 
                            : "bg-white border-gray-300"
                        }`} defaultValue="Bole Road, House #123" />
                      </div>
                      <div>
                        <label className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>City</label>
                        <input className={`w-full p-2 rounded-lg border mt-1 ${
                          darkMode 
                            ? "bg-gray-800 border-gray-700 text-white" 
                            : "bg-white border-gray-300"
                        }`} defaultValue="Addis Ababa" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Buying Preferences
                    </h3>
                    <div className="space-y-2">
                      {["Receive coffee quality updates", "New farmer notifications", "Price drop alerts"].map(pref => (
                        <label key={pref} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked={pref !== "Price drop alerts"} className="rounded" />
                          <span className={darkMode ? "text-gray-300" : "text-gray-700"}>{pref}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    darkMode 
                      ? "bg-gray-800/30 border-gray-700" 
                      : "bg-white border-gray-200"
                  }`}>
                    <h3 className={`font-semibold mb-3 ${darkMode ? "text-white" : "text-gray-900"}`}>
                      Payment Methods
                    </h3>
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between p-3 rounded-lg ${
                        darkMode ? "bg-gray-800" : "bg-gray-50"
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-blue-500 rounded"></div>
                          <span className={darkMode ? "text-gray-300" : "text-gray-700"}>•••• 4242</span>
                        </div>
                        <span className={darkMode ? "text-gray-400" : "text-gray-600"}>Visa</span>
                      </div>
                      <button className={`w-full py-3 border-2 border-dashed rounded-lg transition-colors ${
                        darkMode 
                          ? "border-gray-600 text-gray-400 hover:border-amber-500 hover:text-amber-400" 
                          : "border-gray-300 text-gray-600 hover:border-amber-500 hover:text-amber-600"
                      }`}>
                        + Add Payment Method
                      </button>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white/80 border-gray-200"
          } shadow-lg`}>
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}>
                Coming Soon
              </h3>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 ${themeClass} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Buyer Portal
              </h1>
              <p className={darkMode ? "text-gray-400" : "text-gray-600 mt-2"}>
                Direct from Ethiopian farmers to your doorstep
              </p>
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

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button
                onClick={() => setActiveTab("cart")}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden md:block">
                  <div className="font-semibold">Selam Desta</div>
                  <div className={darkMode ? "text-gray-400" : "text-gray-600"}>Premium Buyer</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`p-4 rounded-2xl backdrop-blur-sm border ${
            darkMode 
              ? "bg-gray-800/50 border-gray-700" 
              : "bg-white/80 border-gray-200"
          } shadow-lg`}>
            <div className="flex flex-wrap gap-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/30"
                        : darkMode
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {/* Active tab indicator */}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 -z-10"
                        transition={{ type: "spring", duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover effect */}
                    {activeTab !== tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10" />
                    )}
                    
                    {/* Icon */}
                    <div className={`transition-transform duration-300 ${
                      activeTab === tab.id 
                        ? "text-white" 
                        : darkMode 
                          ? "text-gray-400 group-hover:text-amber-400" 
                          : "text-gray-600 group-hover:text-amber-600"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Label */}
                    <span className={`relative ${
                      activeTab === tab.id 
                        ? "text-white" 
                        : darkMode 
                          ? "text-gray-300" 
                          : "text-gray-700"
                    }`}>
                      {tab.label}
                    </span>
                    
                    {/* Notification badges */}
                    {tab.id === "cart" && cartItems > 0 && (
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                        activeTab === tab.id
                          ? "bg-white text-amber-700"
                          : darkMode
                            ? "bg-amber-600 text-white"
                            : "bg-red-500 text-white"
                      }`}>
                        {cartItems}
                      </span>
                    )}
                    
                    {tab.id === "favorites" && favorites.length > 0 && (
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                        activeTab === tab.id
                          ? "bg-white text-amber-700"
                          : darkMode
                            ? "bg-pink-600 text-white"
                            : "bg-pink-500 text-white"
                      }`}>
                        {favorites.length}
                      </span>
                    )}
                    
                    {tab.id === "chats" && notifications > 0 && (
                      <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                        activeTab === tab.id
                          ? "bg-white text-amber-700"
                          : darkMode
                            ? "bg-blue-600 text-white"
                            : "bg-blue-500 text-white"
                      }`}>
                        {notifications}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            {/* Add some extra decorative elements */}
            <div className={`mt-4 pt-4 border-t ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                    Secure checkout • Buyer protection
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                  <span className={darkMode ? "text-amber-400" : "text-amber-600"}>
                    Real-time updates
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}