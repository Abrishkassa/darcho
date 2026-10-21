"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingBag, AlertTriangle, Search, Star, Check } from "lucide-react";
import { useFarmerTheme } from "@/app/farmer/theme-context";
import { ReviewDialog, ReviewBadge, type ReviewTarget } from "@/app/components/ReviewDialog";

interface Order {
  id: number | string;
  order_number?: string;
  buyer: string;
  product: string;
  quantity: number;
  total?: number;
  status: string;
  delivery?: string;
  date?: string | null;
}

interface OrderStats {
  total_orders: number;
  confirmed_orders: number;
  total_quantity: number;
}

/** A review the farmer can still leave, or has already left, for an order. */
interface ReviewRow {
  orderId: number;
  reviewId?: number;
  rating?: number;
  comment?: string | null;
  counterpartyName: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function FarmerOrdersPage() {
  const { dark } = useFarmerTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [updateError, setUpdateError] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  // Bumping this re-runs the load effect, so Retry refetches in place.
  const [reloadKey, setReloadKey] = useState(0);

  // Reviews the farmer can write (delivered orders) and the ones already written.
  const [pendingReviews, setPendingReviews] = useState<ReviewRow[]>([]);
  const [writtenReviews, setWrittenReviews] = useState<ReviewRow[]>([]);
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null);

  async function loadReviews() {
    try {
      const res = await fetch("/api/reviews");
      const json = await res.json();
      if (!res.ok || !json.success) return;
      setPendingReviews(json.data.pending || []);
      setWrittenReviews(json.data.written || []);
    } catch {
      // Reviews are supplementary; a failure must not blank the orders table.
    }
  }

  async function loadOrders() {
    try {
      setError("");
      const res = await fetch("/api/farmer/orders");

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.success || !Array.isArray(data.orders)) {
        throw new Error(data.error || "Invalid data format received");
      }

      setOrders(data.orders);
      // Trust the server's stats so the sidebar and this page never disagree.
      setStats(data.stats || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    loadReviews();
  }, [reloadKey]);

  const handleStatusChange = async (orderId: number | string, newStatus: string) => {
    const previousOrders = orders;
    setUpdateError("");
    setUpdatingId(orderId);

    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      const res = await fetch("/api/farmer/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus, deliveryStatus: newStatus }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update order status");
      }

      // Re-sync stats from the server after a successful change, and let the
      // sidebar card refresh its counts.
      loadOrders();
      window.dispatchEvent(new Event("farmer:data-changed"));
    } catch (err: unknown) {
      // Revert on failure
      setOrders(previousOrders);
      setUpdateError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        !q ||
        order.buyer.toLowerCase().includes(q) ||
        order.product.toLowerCase().includes(q) ||
        String(order.id).includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, search]);

  const card = `rounded-2xl border shadow-sm ${dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white"}`;
  const muted = dark ? "text-gray-400" : "text-gray-600";
  const heading = dark ? "text-white" : "text-gray-900";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        <p className={muted}>Loading orders…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-10 text-center ${card}`}>
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
        <p className="text-red-500 font-medium mb-1">{error}</p>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="mt-4 px-5 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Stats come from the API; fall back to local counts only if absent.
  const totalOrders = stats?.total_orders ?? orders.length;
  const confirmedOrders = stats?.confirmed_orders ?? 0;
  const totalQuantity =
    stats?.total_quantity ?? orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${heading}`}>Orders</h1>
        <p className={`mt-1 ${muted}`}>Manage your incoming orders</p>
      </div>

      {updateError && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {updateError}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Total Orders</div>
          <div className={`text-2xl font-bold ${heading}`}>{totalOrders}</div>
        </div>
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Confirmed Orders</div>
          <div className="text-2xl font-bold text-emerald-600">{confirmedOrders}</div>
          <p className={`text-xs mt-1 ${muted}`}>Confirmed, processing, shipped or delivered</p>
        </div>
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Total Quantity</div>
          <div className={`text-2xl font-bold ${heading}`}>
            {Number(totalQuantity).toLocaleString()} kg
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search by buyer, product or ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
            className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${
              dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-amber-500`}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
          className={`px-4 py-2.5 rounded-lg border ${
            dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
          } focus:outline-none focus:ring-2 focus:ring-amber-500`}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className={`p-16 rounded-2xl border text-center ${card}`}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className={`text-lg font-medium mb-1 ${heading}`}>
            {orders.length === 0 ? "No orders yet" : "No matching orders"}
          </p>
          <p className={muted}>
            {orders.length === 0
              ? "Orders will appear here once buyers purchase your coffee."
              : "Try a different search or status filter."}
          </p>
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={dark ? "bg-gray-900/40" : "bg-gray-50"}>
                <tr className={muted}>
                  <th className="px-5 py-3 text-left font-medium">Order</th>
                  <th className="px-5 py-3 text-left font-medium">Buyer</th>
                  <th className="px-5 py-3 text-left font-medium">Product</th>
                  <th className="px-5 py-3 text-right font-medium">Quantity</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-t ${dark ? "border-gray-700" : "border-gray-100"}`}
                  >
                    <td className="px-5 py-3">
                      <div className={`font-mono text-xs ${heading}`}>
                        {order.order_number || `#${order.id}`}
                      </div>
                      {order.date && <div className={`text-xs ${muted}`}>{order.date}</div>}
                    </td>
                    <td className={`px-5 py-3 ${heading}`}>{order.buyer}</td>
                    <td className={`px-5 py-3 ${muted}`}>{order.product}</td>
                    <td className={`px-5 py-3 text-right ${heading}`}>{order.quantity} kg</td>
                    <td className={`px-5 py-3 text-right font-medium ${heading}`}>
                      ETB {Number(order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        aria-label={`Status for order ${order.id}`}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border ${
                          dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
                        } disabled:opacity-50 disabled:cursor-wait focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className={`ml-2 text-xs ${muted}`}>Saving…</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {(() => {
                        const orderId = Number(order.id);
                        const written = writtenReviews.find((r) => r.orderId === orderId);
                        if (written) {
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewTarget({
                                  orderId,
                                  orderNumber: order.order_number || `#${order.id}`,
                                  productName: order.product,
                                  counterpartyName: written.counterpartyName,
                                  counterpartyRole: "buyer",
                                  existingRating: written.rating,
                                  existingComment: written.comment,
                                })
                              }
                              className="text-left hover:opacity-80 transition-opacity"
                              aria-label={`Edit your review of ${written.counterpartyName}`}
                            >
                              <ReviewBadge rating={written.rating || 0} comment={written.comment ?? null} />
                            </button>
                          );
                        }

                        const pending = pendingReviews.find((r) => r.orderId === orderId);
                        if (pending) {
                          return (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewTarget({
                                  orderId,
                                  orderNumber: order.order_number || `#${order.id}`,
                                  productName: order.product,
                                  counterpartyName: pending.counterpartyName,
                                  counterpartyRole: "buyer",
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-medium hover:bg-amber-700 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5" aria-hidden="true" />
                              Rate
                            </button>
                          );
                        }

                        if (order.status === "delivered") {
                          return (
                            <span className={`inline-flex items-center gap-1.5 text-xs ${muted}`}>
                              <Check className="w-3.5 h-3.5" aria-hidden="true" />
                              Done
                            </span>
                          );
                        }

                        return <span className={`text-xs ${muted}`}>—</span>;
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={`px-5 py-3 border-t flex items-center justify-between text-sm ${dark ? "border-gray-700" : "border-gray-100"}`}>
            <span className={muted}>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <button
              onClick={() => loadOrders()}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

      {reviewTarget && (
        <ReviewDialog
          target={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => {
            setReviewTarget(null);
            loadReviews();
            // A new review can change the farmer's average rating, so tell the
            // rest of the farmer portal its cached figures are stale.
            window.dispatchEvent(new Event("farmer:data-changed"));
          }}
        />
      )}
    </div>
  );
}
