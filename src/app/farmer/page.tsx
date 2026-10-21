"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Loader2,
  Plus,
  ChevronRight,
  Star,
} from "lucide-react";
import { useFarmerTheme } from "@/app/farmer/theme-context";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  activeOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  monthlyOrders: number;
  averageRating: number;
}

interface RecentOrder {
  id: number;
  orderNumber: string;
  productName: string;
  buyerName: string;
  quantity: number;
  totalPrice: number;
  status: string;
  orderDate: string;
}

interface LowStockProduct {
  id: number;
  name: string;
  grade: string;
  quantity: number;
  price: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  lowStockProducts: LowStockProduct[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  processing: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function statusClass(status: string) {
  return STATUS_STYLES[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
}

export default function FarmerDashboardPage() {
  const { dark } = useFarmerTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bumping this re-runs the load effect, so Retry refetches in place instead
  // of doing a full page reload.
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/farmer/dashboard");
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) throw new Error(json.error || "Failed to load dashboard");
        setData(json.data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const card = `rounded-2xl border shadow-sm ${dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white"}`;
  const muted = dark ? "text-gray-400" : "text-gray-600";
  const heading = dark ? "text-white" : "text-gray-900";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        <p className={muted}>Loading your dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`p-10 text-center ${card}`}>
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-500 font-medium mb-1">{error || "No dashboard data"}</p>
        <p className={`text-sm mb-4 ${muted}`}>Please try again in a moment.</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="px-5 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts } = data;

  const metricCards = [
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      hint: "Listed on the marketplace",
      icon: Package,
      tone: "blue",
    },
    {
      label: "Active Orders",
      value: stats.activeOrders.toLocaleString(),
      hint: `${stats.pendingOrders} awaiting confirmation`,
      icon: ShoppingBag,
      tone: "emerald",
    },
    {
      label: "Revenue (30 days)",
      value: `ETB ${stats.monthlyRevenue.toLocaleString()}`,
      hint: `${stats.monthlyOrders} orders this month`,
      icon: DollarSign,
      tone: "amber",
    },
    {
      label: "Average Rating",
      value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—",
      hint: stats.averageRating > 0 ? "Across all reviews" : "No reviews yet",
      icon: Star,
      tone: "purple",
    },
  ];

  const toneClasses: Record<string, string> = {
    blue: dark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-600",
    emerald: dark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-600",
    amber: dark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-600",
    purple: dark ? "bg-purple-900/30 text-purple-400" : "bg-purple-100 text-purple-600",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${heading}`}>Dashboard</h1>
          <p className={`mt-1 ${muted}`}>Your farm at a glance</p>
        </div>
        <Link
          href="/farmer/products"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className={`p-5 ${card}`}>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${toneClasses[metric.tone]}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className={`text-2xl font-bold ${heading}`}>{metric.value}</div>
              <div className={`text-sm font-medium mt-0.5 ${heading}`}>{metric.label}</div>
              <div className={`text-xs mt-1 ${muted}`}>{metric.hint}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className={`lg:col-span-2 ${card} overflow-hidden`}>
          <div className={`flex items-center justify-between px-5 py-4 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <h2 className={`font-semibold ${heading}`}>Recent Orders</h2>
            <Link
              href="/farmer/orders"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className={`px-5 py-12 text-center ${muted}`}>
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No orders yet</p>
              <p className="text-sm mt-1">Orders will appear here once buyers purchase your coffee.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={dark ? "bg-gray-900/40" : "bg-gray-50"}>
                  <tr className={muted}>
                    <th className="px-5 py-3 text-left font-medium">Order</th>
                    <th className="px-5 py-3 text-left font-medium">Buyer</th>
                    <th className="px-5 py-3 text-left font-medium">Product</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className={`border-t ${dark ? "border-gray-700" : "border-gray-100"}`}
                    >
                      <td className={`px-5 py-3 font-mono text-xs ${heading}`}>{order.orderNumber}</td>
                      <td className={`px-5 py-3 ${heading}`}>{order.buyerName}</td>
                      <td className={`px-5 py-3 ${muted}`}>{order.productName}</td>
                      <td className={`px-5 py-3 text-right font-medium ${heading}`}>
                        ETB {order.totalPrice?.toLocaleString() ?? 0}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusClass(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low stock */}
        <div className={`${card} overflow-hidden`}>
          <div className={`flex items-center gap-2 px-5 py-4 border-b ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className={`font-semibold ${heading}`}>Low Stock</h2>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className={`px-5 py-12 text-center ${muted}`}>
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">Stock levels look healthy</p>
              <p className="text-sm mt-1">Products under 10 kg will show up here.</p>
            </div>
          ) : (
            <ul className={`divide-y ${dark ? "divide-gray-700" : "divide-gray-100"}`}>
              {lowStockProducts.map((product) => (
                <li key={product.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${heading}`}>{product.name}</div>
                    <div className={`text-xs ${muted}`}>
                      {product.grade ? `${product.grade} · ` : ""}ETB {product.price?.toLocaleString() ?? 0}/kg
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {product.quantity} kg
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className={`px-5 py-3 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <Link
              href="/farmer/products"
              className="text-sm font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
            >
              Manage products <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Order status breakdown */}
      <div className={`${card} p-5`}>
        <h2 className={`font-semibold mb-4 ${heading}`}>Order Status</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending", value: stats.pendingOrders, icon: TrendingDown, tone: "amber" },
            { label: "Active", value: stats.activeOrders, icon: TrendingUp, tone: "blue" },
            { label: "Completed", value: stats.completedOrders, icon: Package, tone: "emerald" },
            { label: "Total", value: stats.totalOrders, icon: ShoppingBag, tone: "purple" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${toneClasses[item.tone]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className={`text-lg font-bold ${heading}`}>{item.value}</div>
                  <div className={`text-xs ${muted}`}>{item.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
