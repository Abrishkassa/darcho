"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw, Truck } from "lucide-react";
import { useBuyerTheme } from "../theme-context";

interface OrderRow {
  id: number;
  order_number: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  payment_status: string;
  order_date: string;
  products?: {
    name: string;
    grade: string;
    farmers?: {
      farm_name: string;
      users?: { full_name: string; phone: string };
    };
  };
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const FILTER_OPTIONS = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function BuyerOrdersPage() {
  const { dark } = useBuyerTheme();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/buyer/orders${params}`);
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to load orders");
      }

      setOrders(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ET", {
      style: "currency",
      currency: "ETB",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>My Orders</h1>
          <p className={`mt-1 ${mutedText}`}>Track and manage your coffee orders</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-2xl border ${cardBorder}`}>
          <p className={`text-sm ${mutedText}`}>Total Orders</p>
          <p className={`text-2xl font-bold mt-1 ${headingText}`}>{orders.length}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBorder}`}>
          <p className={`text-sm ${mutedText}`}>Pending</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">{pendingCount}</p>
        </div>
        <div className={`p-5 rounded-2xl border ${cardBorder}`}>
          <p className={`text-sm ${mutedText}`}>Total Spent</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-500">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              statusFilter === status
                ? "bg-amber-600 text-white"
                : dark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-600 hover:bg-amber-50 border border-gray-200"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={mutedText}>Loading your orders...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className={`p-16 rounded-2xl border text-center ${cardBorder}`}>
          <Truck className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No orders{statusFilter !== "all" ? ` (${statusFilter})` : " yet"}</p>
          <p className={mutedText}>
            {statusFilter !== "all" ? "Try a different filter." : "Orders you place will show up here."}
          </p>
          {statusFilter === "all" && (
            <Link
              href="/buyer"
              className="inline-block mt-4 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Browse Products
            </Link>
          )}
        </div>
      ) : (
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${cardBorder}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={dark ? "bg-gray-900/50" : "bg-amber-800 text-white"}>
                  <th className="py-3 px-6 text-left font-semibold">Order #</th>
                  <th className="py-3 px-6 text-left font-semibold">Product</th>
                  <th className="py-3 px-6 text-left font-semibold">Farmer</th>
                  <th className="py-3 px-6 text-left font-semibold">Qty</th>
                  <th className="py-3 px-6 text-left font-semibold">Total</th>
                  <th className="py-3 px-6 text-left font-semibold">Date</th>
                  <th className="py-3 px-6 text-left font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b ${
                      dark ? "border-gray-700 hover:bg-gray-800/50" : "border-gray-100 hover:bg-amber-50"
                    } transition-colors`}
                  >
                    <td className="py-4 px-6 font-medium whitespace-nowrap">{order.order_number}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{order.products?.name || "Unknown product"}</div>
                      {order.products?.grade && <div className={`text-xs ${mutedText}`}>Grade {order.products.grade}</div>}
                    </td>
                    <td className="py-4 px-6">
                      {order.products?.farmers?.users?.full_name || order.products?.farmers?.farm_name || "Unknown farmer"}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">{order.quantity} kg</td>
                    <td className="py-4 px-6 font-semibold whitespace-nowrap">{formatCurrency(order.total_price)}</td>
                    <td className="py-4 px-6 whitespace-nowrap">{formatDate(order.order_date)}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap capitalize ${
                          STATUS_STYLES[order.status] || "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className={`px-6 py-4 border-t text-sm ${
              dark ? "border-gray-700 text-gray-400" : "border-gray-100 text-gray-600"
            }`}
          >
            Showing {orders.length} orders
          </div>
        </div>
      )}
    </div>
  );
}
