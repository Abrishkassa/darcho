"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number | string;
  buyer: string;
  product: string;
  quantity: number;
  status: string;
}

const STATUS_OPTIONS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function FarmerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [updateError, setUpdateError] = useState<string>("");

  async function loadOrders() {
    try {
      const res = await fetch("/api/farmer/orders");

      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      const data = await res.json();

      // Handle different response formats
      if (data.orders && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else if (Array.isArray(data)) {
        setOrders(data);
      } else {
        throw new Error("Invalid data format received");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load orders";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

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
    } catch (err: unknown) {
      // Revert on failure
      setOrders(previousOrders);
      setUpdateError(err instanceof Error ? err.message : "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Orders</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[400px]">
        <h1 className="text-2xl font-bold text-amber-900 mb-4">Orders</h1>
        <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <p className="text-xl text-gray-600 font-medium mb-2">No orders found</p>
          <p className="text-gray-500">You don't have any orders yet.</p>
        </div>
      </div>
    );
  }

  // Calculate order stats
  const totalOrders = orders.length;
  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  const confirmedOrders = orders.filter(order => 
    order.status.toLowerCase().includes('confirm') || 
    order.status.toLowerCase() === 'completed'
  ).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Orders</h1>
          <p className="text-gray-600">Manage your incoming orders</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {totalOrders} orders
        </div>
      </div>

      {updateError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {updateError}
        </div>
      )}

      {/* Order Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-amber-700">{totalOrders}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Confirmed Orders</p>
          <p className="text-2xl font-bold text-green-700">{confirmedOrders}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Total Quantity</p>
          <p className="text-2xl font-bold text-blue-700">{totalQuantity} kg</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-amber-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-amber-800 text-white">
                <th className="py-3 px-6 text-left font-semibold">Order ID</th>
                <th className="py-3 px-6 text-left font-semibold">Buyer</th>
                <th className="py-3 px-6 text-left font-semibold">Product</th>
                <th className="py-3 px-6 text-left font-semibold">Quantity</th>
                <th className="py-3 px-6 text-left font-semibold">Status</th>
              </tr>
            </thead>
            
            <tbody>
              {orders.map((order) => {
                // Determine status color
                const statusColor = order.status.toLowerCase().includes('pending') 
                  ? 'text-yellow-600 bg-yellow-50' 
                  : order.status.toLowerCase().includes('confirm') || order.status.toLowerCase() === 'completed'
                  ? 'text-green-600 bg-green-50'
                  : 'text-red-600 bg-red-50';

                return (
                  <tr 
                    key={order.id} 
                    className="border-b border-gray-100 hover:bg-amber-50 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-gray-800">
                      #{order.id}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{order.buyer}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium">{order.product}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold">{order.quantity}</span>
                      <span className="text-gray-500 ml-1">kg</span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={order.status}
                        disabled={updatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border-0 cursor-pointer disabled:opacity-50 disabled:cursor-wait ${statusColor}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </option>
                        ))}
                      </select>
                      {updatingId === order.id && (
                        <span className="ml-2 text-xs text-gray-400">Saving...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>Showing {orders.length} orders</div>
            <div className="flex items-center space-x-4">
              <button className="text-amber-700 hover:text-amber-800 font-medium">
                Export
              </button>
              <button 
                onClick={() => loadOrders()}
                className="text-amber-700 hover:text-amber-800 font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}