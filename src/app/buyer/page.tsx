"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Search,
  ShoppingCart,
  Heart,
  Coffee,
  MapPin,
  User,
  CheckCircle,
  Loader2,
  X,
} from "lucide-react";
import { useBuyerTheme } from "./theme-context";

interface FarmerInfo {
  id?: number;
  farm_name?: string;
  region?: string;
  avg_rating?: number;
  users?: { full_name?: string; phone?: string } | { full_name?: string; phone?: string }[];
}

interface Product {
  id: number;
  name: string;
  grade: string;
  category: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  description: string | null;
  origin_region: string;
  certifications: string[];
  image_urls: string[];
  status: string;
  farmers?: FarmerInfo;
}

const CATEGORIES = ["all", "arabica", "robusta", "specialty", "organic"];

/** Supabase embeds can come back as object or single-element array; normalize. */
function unwrap<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function farmerOf(product: Product): FarmerInfo | null {
  return unwrap(product.farmers);
}

function farmerName(product: Product): string {
  const farmer = farmerOf(product);
  const user = unwrap(farmer?.users);
  return user?.full_name || farmer?.farm_name || "Unknown farmer";
}

export default function BuyerProductsPage() {
  const { dark } = useBuyerTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Order modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderForm, setOrderForm] = useState({
    quantity: "",
    deliveryDate: "",
    deliveryLocation: "",
    paymentMethod: "bank_transfer",
    notes: "",
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/buyer/products?limit=60");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load products");
        setProducts(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Load favorites so the heart reflects reality
  useEffect(() => {
    fetch("/api/buyer/favorites?limit=100")
      .then((res) => (res.ok ? res.json() : { success: false }))
      .then((data) => {
        if (data.success) {
          setFavoriteIds(new Set((data.data || []).map((row: { productId: number }) => row.productId)));
        }
      })
      .catch(() => {});
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.origin_region.toLowerCase().includes(q) ||
        farmerName(p).toLowerCase().includes(q);
      const matchesCategory = category === "all" || p.category?.toLowerCase() === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, category]);

  const toggleFavorite = async (product: Product) => {
    const isFavorite = favoriteIds.has(product.id);
    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorite) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    try {
      const res = await fetch(`/api/buyer/favorites/${product.id}`, {
        method: isFavorite ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error();
      showToast(isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      // Revert on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
      showToast("Could not update favorites", "error");
    }
  };

  const addToCart = async (product: Product) => {
    setAddingToCart(product.id);
    try {
      const res = await fetch("/api/buyer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      showToast("Added to cart");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart", "error");
    } finally {
      setAddingToCart(null);
    }
  };

  const handleOrder = async () => {
    if (!selectedProduct) return;
    setOrderSubmitting(true);
    try {
      const res = await fetch("/api/buyer/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          farmerId: unwrap(selectedProduct.farmers)?.id,
          quantity: parseFloat(orderForm.quantity),
          unitPrice: selectedProduct.price_per_unit,
          totalPrice: parseFloat(orderForm.quantity) * selectedProduct.price_per_unit,
          shippingAddress: orderForm.deliveryLocation,
          deliveryDate: orderForm.deliveryDate,
          paymentMethod: orderForm.paymentMethod,
          notes: orderForm.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to place order");
      setOrderSuccess(true);
      setTimeout(() => {
        setSelectedProduct(null);
        setOrderSuccess(false);
        setOrderForm({ quantity: "", deliveryDate: "", deliveryLocation: "", paymentMethod: "bank_transfer", notes: "" });
      }, 2000);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to place order", "error");
    } finally {
      setOrderSubmitting(false);
    }
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>Browse Coffee Products</h1>
          <p className={`mt-1 ${mutedText}`}>Direct from Ethiopian farmers</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search products, regions, farmers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
            className={`${inputClass} pl-10`}
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              category === cat
                ? "bg-amber-600 text-white"
                : dark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-white text-gray-600 hover:bg-amber-50 border border-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={mutedText}>Loading products...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
          <Package className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-red-500 font-medium mb-1">{error}</p>
          <p className={`text-sm ${mutedText}`}>Please try again in a moment.</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className={`p-16 rounded-2xl border text-center ${cardBorder}`}>
          <Coffee className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium mb-1">No products found</p>
          <p className={mutedText}>
            {searchQuery || category !== "all"
              ? "Try a different search or category."
              : "Check back soon — farmers are listing harvests all the time."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProducts.map((product, index) => {
            const isFavorite = favoriteIds.has(product.id);
            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${cardBorder}`}
              >
                {product.image_urls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image_urls[0]}
                    alt={product.name}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Coffee className="w-14 h-14 text-white opacity-80" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className={`font-bold text-lg leading-tight ${headingText}`}>{product.name}</h2>
                    <div className="flex items-center gap-1">
                      {product.grade && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                            dark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {product.grade}
                        </span>
                      )}
                      <button
                        onClick={() => toggleFavorite(product)}
                        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                        aria-pressed={isFavorite}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {product.description && (
                    <p className={`text-sm mb-3 line-clamp-2 ${mutedText}`}>{product.description}</p>
                  )}

                  <div className={`space-y-1.5 text-sm mb-4 ${mutedText}`}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{product.origin_region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 shrink-0" />
                      <span>{farmerName(product)}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-500">
                        ETB {product.price_per_unit.toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                      </div>
                      <div className={`text-sm ${mutedText}`}>
                        {product.quantity > 0 ? `${product.quantity} ${product.unit} available` : "Out of stock"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={addingToCart === product.id || product.quantity <= 0}
                        aria-label={`Add ${product.name} to cart`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                          dark
                            ? "bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
                        }`}
                      >
                        {addingToCart === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        Cart
                      </button>
                      <button
                        onClick={() => setSelectedProduct(product)}
                        disabled={product.quantity <= 0}
                        className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium ${
              toast.type === "success"
                ? "bg-gray-900 text-white"
                : "bg-red-600 text-white"
            }`}
            role="status"
          >
            {toast.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => !orderSubmitting && setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Place order"
              className={`w-full max-w-lg rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto ${
                dark ? "bg-gray-900" : "bg-white"
              }`}
            >
              {orderSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Order Placed!</h3>
                  <p className={mutedText}>The farmer has been notified.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold">Place Order</h2>
                      <p className={`text-sm mt-0.5 ${mutedText}`}>
                        {selectedProduct.name} · ETB {selectedProduct.price_per_unit.toLocaleString()}/
                        {selectedProduct.unit} · sold by {farmerName(selectedProduct)}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      aria-label="Close"
                      className={`p-2 rounded-lg ${
                        dark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                      } transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="order-quantity" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        Quantity ({selectedProduct.unit}) *
                      </label>
                      <input
                        id="order-quantity"
                        type="number"
                        min="1"
                        max={selectedProduct.quantity}
                        placeholder={`Max ${selectedProduct.quantity} ${selectedProduct.unit}`}
                        value={orderForm.quantity}
                        onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                        className={inputClass}
                      />
                      {orderForm.quantity && parseFloat(orderForm.quantity) > 0 && (
                        <p className="text-amber-600 dark:text-amber-500 text-sm mt-1 font-medium">
                          Total: ETB{" "}
                          {(parseFloat(orderForm.quantity) * selectedProduct.price_per_unit).toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="order-date" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        Preferred Delivery Date *
                      </label>
                      <input
                        id="order-date"
                        type="date"
                        value={orderForm.deliveryDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="order-location" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        Delivery Location *
                      </label>
                      <input
                        id="order-location"
                        type="text"
                        placeholder="e.g. Hawassa, Sidama Region"
                        value={orderForm.deliveryLocation}
                        onChange={(e) => setOrderForm({ ...orderForm, deliveryLocation: e.target.value })}
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="order-payment" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        Payment Method
                      </label>
                      <select
                        id="order-payment"
                        value={orderForm.paymentMethod}
                        onChange={(e) => setOrderForm({ ...orderForm, paymentMethod: e.target.value })}
                        className={inputClass}
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="telebirr">Telebirr</option>
                        <option value="cbe_birr">CBE Birr</option>
                        <option value="cash">Cash on Delivery</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="order-notes" className={`block text-sm font-medium mb-1 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                        Additional Notes
                      </label>
                      <textarea
                        id="order-notes"
                        rows={3}
                        placeholder="Any special requirements..."
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => setSelectedProduct(null)}
                      disabled={orderSubmitting}
                      className={`w-full sm:flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                        dark
                          ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleOrder}
                      disabled={
                        orderSubmitting ||
                        !orderForm.quantity ||
                        !orderForm.deliveryLocation ||
                        !orderForm.deliveryDate
                      }
                      className="flex-1 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {orderSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      {orderSubmitting
                        ? "Placing..."
                        : `Place Order · ETB ${orderForm.quantity ? (parseFloat(orderForm.quantity) * selectedProduct.price_per_unit).toLocaleString() : "0"}`}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
