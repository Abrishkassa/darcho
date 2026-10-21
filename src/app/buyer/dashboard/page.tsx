"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  DollarSign,
  Heart,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Coffee,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useBuyerTheme } from "../theme-context";

interface ProductRow {
  id: number;
  name: string;
  grade: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  origin_region: string;
  farmers?: { farm_name?: string; avg_rating?: number; users?: { full_name?: string } | { full_name?: string }[] } | null;
}

interface OrderRow {
  id: number;
  order_number: string;
  status: string;
  total_price: number;
  order_date: string;
  products?: { name?: string; farmers?: { farm_name?: string; users?: { full_name?: string } | { full_name?: string }[] } } | null;
}

interface DashboardData {
  stats: {
    totalOrders: number;
    totalSpent: number;
    cartItems: number;
    favorites: number;
    activeChats: number;
    averageRating?: number;
    reviewCount?: number;
  };
  recentOrders: OrderRow[];
  recommendedProducts: ProductRow[];
  buyerProfile: { companyName?: string | null; businessType?: string | null; location?: string | null };
}

function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const STATUS_STYLES: Record<string, string> = {
  delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function BuyerDashboardPage() {
  const { dark } = useBuyerTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/buyer/dashboard");
      if (res.status === 401) throw new Error("Session expired. Please login again.");
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.error || "Failed to load dashboard");
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(
      amount || 0
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const diffDays = Math.ceil(Math.abs(Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className={`p-6 rounded-2xl border animate-pulse ${cardBorder}`}>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-gray-200 dark:bg-gray-800 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl border ${cardBorder}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${headingText}`}>Unable to Load Dashboard</h2>
          <p className={`mb-6 ${mutedText}`}>{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-6 py-3 rounded-xl bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentOrders, recommendedProducts } = data;

  const statCards = [
    { label: "Total Orders", value: stats.totalOrders.toString(), icon: Package, href: "/buyer/orders" },
    { label: "Total Spent", value: formatCurrency(stats.totalSpent), icon: DollarSign, href: "/buyer/orders" },
    { label: "Favorites", value: stats.favorites.toString(), icon: Heart, href: "/buyer/favorites" },
    { label: "Active Chats", value: stats.activeChats.toString(), icon: MessageCircle, href: "/buyer/chats" },
  ];

  // Only surfaced once a farmer has actually rated this buyer, so a new account
  // is never presented with an empty or zero score.
  if ((stats.reviewCount ?? 0) > 0) {
    statCards.push({
      label: "Your Rating",
      value: `${(stats.averageRating ?? 0).toFixed(1)} (${stats.reviewCount})`,
      icon: Star,
      href: "/buyer/orders",
    });
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 p-8 text-white relative">
        <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5" />
              <span className="text-amber-100 font-semibold">Welcome back!</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Hello, {data.buyerProfile?.companyName || "Coffee Buyer"} 👋
            </h1>
            <p className="text-amber-100 max-w-2xl">
              Your coffee trading dashboard is updated with the latest market insights and recommendations.
            </p>
          </div>
          <button
            onClick={fetchDashboard}
            disabled={loading}
            className="hidden md:inline-flex px-5 py-2.5 rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link
              href={stat.href}
              className={`block p-5 rounded-2xl border shadow-sm hover:shadow-md transition-shadow ${cardBorder}`}
            >
              <stat.icon className="w-6 h-6 text-amber-600 dark:text-amber-500 mb-3" />
              <div className={`text-2xl font-bold mb-0.5 ${headingText}`}>{stat.value}</div>
              <div className={`text-sm ${mutedText}`}>{stat.label}</div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <section className={`lg:col-span-2 p-6 rounded-2xl border ${cardBorder}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-semibold ${headingText}`}>Recent Orders</h2>
            <Link
              href="/buyer/orders"
              className="text-sm text-amber-600 dark:text-amber-500 hover:underline inline-flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className={`p-10 text-center ${mutedText}`}>
              <Package className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="mb-4">No orders yet. Start browsing products!</p>
              <Link
                href="/buyer"
                className="inline-block px-5 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const farmer = unwrap(unwrap(order.products)?.farmers);
                const farmerUser = unwrap(farmer?.users);
                return (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition-colors ${
                      dark
                        ? "border-gray-700 hover:bg-gray-800/50"
                        : "border-gray-200 hover:bg-amber-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                        <Coffee className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className={`font-medium truncate ${headingText}`}>
                          {order.products?.name || `Order ${order.order_number}`}
                        </div>
                        <div className={`text-sm truncate ${mutedText}`}>
                          {farmerUser?.full_name || farmer?.farm_name || "Farmer"} · {formatDate(order.order_date)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-amber-600 dark:text-amber-500">
                        {formatCurrency(order.total_price)}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full inline-block mt-1 capitalize ${
                          STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recommended products */}
        <section className={`p-6 rounded-2xl border ${cardBorder}`}>
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-lg font-semibold ${headingText}`}>Recommended</h2>
            <Link
              href="/buyer"
              className="text-sm text-amber-600 dark:text-amber-500 hover:underline inline-flex items-center gap-1"
            >
              Browse All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {recommendedProducts.length === 0 ? (
            <div className={`p-8 text-center ${mutedText}`}>
              <Coffee className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No recommendations yet. Make your first order!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedProducts.slice(0, 5).map((product) => {
                const farmer = unwrap(product.farmers);
                const farmerUser = unwrap(farmer?.users);
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      dark ? "border-gray-700 hover:bg-gray-800/50" : "border-gray-200 hover:bg-amber-50/60"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                      <Coffee className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium truncate ${headingText}`}>{product.name}</div>
                      <div className={`text-xs truncate ${mutedText}`}>
                        {farmerUser?.full_name || farmer?.farm_name || product.origin_region}
                      </div>
                      {typeof farmer?.avg_rating === "number" && farmer.avg_rating > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs">{farmer.avg_rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-amber-600 dark:text-amber-500">
                        {formatCurrency(product.price_per_unit)}/{product.unit}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
