"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Trash2,
  Loader2,
  RefreshCw,
  Coffee,
  X,
} from "lucide-react";
import { useBuyerTheme } from "../theme-context";
import EmptyState from "../components/EmptyState";

interface CartItem {
  id: number;
  orderNumber: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productId: number;
  farmerId: number;
  product: {
    id: number;
    name: string;
    grade: string;
    quantity: number;
    unit: string;
    imageUrls?: string[];
    farmer?: { farmName?: string; user?: { fullName?: string } } | null;
  };
}

export default function BuyerCartPage() {
  const { dark } = useBuyerTheme();
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [clearing, setClearing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: "",
    deliveryDate: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/buyer/cart");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load cart");
      setItems(data.data || []);
      setTotalPrice(data.totalPrice || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const removeItem = async (item: CartItem) => {
    setRemovingId(item.id);
    try {
      const res = await fetch(`/api/buyer/cart?itemId=${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      setTotalPrice((prev) => prev - item.totalPrice);
      showToast("Removed from cart");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const clearCart = async () => {
    setClearing(true);
    try {
      const res = await fetch("/api/buyer/cart", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setItems([]);
      setTotalPrice(0);
      showToast("Cart cleared");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  const placeOrder = async () => {
    setPlacing(true);
    setPlaceError(null);
    try {
      // Convert each cart row into a real pending order
      for (const item of items) {
        const res = await fetch("/api/buyer/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: item.productId,
            farmerId: item.farmerId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            shippingAddress: checkoutForm.shippingAddress,
            deliveryDate: checkoutForm.deliveryDate,
            paymentMethod: checkoutForm.paymentMethod,
            notes: checkoutForm.notes,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to place order");
      }

      await fetch("/api/buyer/cart", { method: "DELETE" });
      setItems([]);
      setTotalPrice(0);
      showToast("Orders placed for all items");
      window.dispatchEvent(new Event("cart:updated"));

      setCheckoutOpen(false);
      setCheckoutForm({ shippingAddress: "", deliveryDate: "", paymentMethod: "bank_transfer", notes: "" });
    } catch (err) {
      setPlaceError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB", minimumFractionDigits: 0 }).format(
      amount || 0
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>Shopping Cart</h1>
          <p className={`mt-1 ${mutedText}`}>
            {items.length > 0
              ? `${items.length} item${items.length === 1 ? "" : "s"} ready to order`
              : "Review your items before checkout"}
          </p>
        </div>
        {items.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={clearCart}
              disabled={clearing}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                dark
                  ? "border border-gray-600 text-gray-300 hover:bg-gray-800"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Clear Cart
            </button>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={mutedText}>Loading your cart...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchCart}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse the marketplace and add coffee you would like to buy."
          action={{ label: "Browse Products", href: "/buyer" }}
        />
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex items-center gap-4 ${cardBorder}`}
              >
                {item.product.imageUrls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.product.imageUrls[0]}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0">
                    <Coffee className="w-8 h-8 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className={`font-semibold truncate ${headingText}`}>{item.product.name}</h2>
                      <p className={`text-sm truncate ${mutedText}`}>
                        {item.product.farmer?.user?.fullName || item.product.farmer?.farmName || "Farmer"}
                        {item.product.grade ? ` · Grade ${item.product.grade}` : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item)}
                      disabled={removingId === item.id}
                      aria-label={`Remove ${item.product.name} from cart`}
                      className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 shrink-0"
                    >
                      {removingId === item.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div className={`text-sm ${mutedText}`}>
                      {item.quantity} {item.product.unit} × {formatCurrency(item.unitPrice)}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-600 dark:text-amber-500">
                        {formatCurrency(item.totalPrice)}
                      </div>
                      <div className={`text-xs ${mutedText}`}>{item.orderNumber}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <aside className={`p-6 rounded-2xl border shadow-sm ${cardBorder}`}>
            <h2 className={`text-lg font-semibold mb-4 ${headingText}`}>Order Summary</h2>
            <div className={`space-y-3 text-sm ${mutedText}`}>
              <div className="flex justify-between">
                <span>Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>Arranged with farmer</span>
              </div>
            </div>
            <div className={`mt-4 pt-4 border-t flex justify-between font-bold ${dark ? "border-gray-700 text-white" : "border-gray-200 text-gray-900"}`}>
              <span>Total</span>
              <span className="text-amber-600 dark:text-amber-500">{formatCurrency(totalPrice)}</span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-5 w-full py-3 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link
              href="/buyer"
              className={`mt-3 block text-center text-sm ${mutedText} hover:text-amber-600 hover:underline`}
            >
              Continue shopping
            </Link>
          </aside>
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => !placing && setCheckoutOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.96, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Checkout"
            className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${
              dark ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold">Checkout</h2>
                <p className={`text-sm mt-0.5 ${mutedText}`}>
                  {items.length} item{items.length === 1 ? "" : "s"} · {formatCurrency(totalPrice)}
                </p>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                aria-label="Close"
                className={`p-2 rounded-lg ${dark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="co-location"
                  className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Delivery Location *
                </label>
                <input
                  id="co-location"
                  type="text"
                  placeholder="e.g. Hawassa, Sidama Region"
                  value={checkoutForm.shippingAddress}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, shippingAddress: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="co-date"
                  className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Preferred Delivery Date *
                </label>
                <input
                  id="co-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={checkoutForm.deliveryDate}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, deliveryDate: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="co-payment"
                  className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Payment Method
                </label>
                <select
                  id="co-payment"
                  value={checkoutForm.paymentMethod}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, paymentMethod: e.target.value })}
                  className={inputClass}
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="telebirr">Telebirr</option>
                  <option value="cbe_birr">CBE Birr</option>
                  <option value="cash">Cash on Delivery</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="co-notes"
                  className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}
                >
                  Additional Notes
                </label>
                <textarea
                  id="co-notes"
                  rows={3}
                  placeholder="Any special requirements..."
                  value={checkoutForm.notes}
                  onChange={(e) => setCheckoutForm({ ...checkoutForm, notes: e.target.value })}
                  className={inputClass}
                />
              </div>

              {placeError && <p className="text-sm text-red-500">{placeError}</p>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => setCheckoutOpen(false)}
                disabled={placing}
                className={`w-full sm:flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                  dark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={placeOrder}
                disabled={placing || !checkoutForm.shippingAddress || !checkoutForm.deliveryDate}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {placing && <Loader2 className="w-4 h-4 animate-spin" />}
                {placing ? "Placing..." : `Place Order · ${formatCurrency(totalPrice)}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl bg-gray-900 text-white text-sm font-medium"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
