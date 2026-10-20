"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader2,
  RefreshCw,
  Coffee,
  MapPin,
  User,
} from "lucide-react";
import { useBuyerTheme } from "../theme-context";
import EmptyState from "../components/EmptyState";

interface FavoriteRow {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    grade?: string;
    pricePerUnit?: number;
    quantity?: number;
    unit?: string;
    originRegion?: string;
    imageUrls?: string[];
    status?: string;
    farmer?: {
      farmName?: string;
      avgRating?: number;
      user?: { fullName?: string } | null;
    } | null;
  };
}

export default function BuyerFavoritesPage() {
  const { dark } = useBuyerTheme();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/buyer/favorites?limit=60");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load favorites");
      setFavorites(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = async (row: FavoriteRow) => {
    setBusyId(row.productId);
    try {
      const res = await fetch(`/api/buyer/favorites/${row.productId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      setFavorites((prev) => prev.filter((f) => f.productId !== row.productId));
      showToast("Removed from favorites");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove favorite");
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = async (row: FavoriteRow) => {
    setBusyId(row.productId);
    try {
      const res = await fetch("/api/buyer/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: row.productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error);
      showToast("Added to cart");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setBusyId(null);
    }
  };

  const cardBorder = dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white";
  const mutedText = dark ? "text-gray-400" : "text-gray-600";
  const headingText = dark ? "text-white" : "text-gray-900";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${headingText}`}>Favorites</h1>
          <p className={`mt-1 ${mutedText}`}>Coffee you have saved for later</p>
        </div>
        <button
          onClick={fetchFavorites}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={mutedText}>Loading favorites...</p>
        </div>
      ) : error ? (
        <div className={`p-10 rounded-2xl border text-center ${cardBorder}`}>
          <p className="text-red-500 font-medium mb-4">{error}</p>
          <button
            onClick={fetchFavorites}
            className="px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any product to save it here."
          action={{ label: "Browse Products", href: "/buyer" }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {favorites.map((row, index) => {
            const product = row.product;
            const farmerUser = product.farmer?.user;
            return (
              <motion.article
                key={row.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.3) }}
                className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-lg transition-shadow ${cardBorder}`}
              >
                {product.imageUrls?.[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.imageUrls[0]} alt={product.name} className="w-full h-40 object-cover" />
                ) : (
                  <div className="h-40 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Coffee className="w-14 h-14 text-white opacity-80" />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className={`font-bold text-lg leading-tight ${headingText}`}>{product.name}</h2>
                    {product.grade && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
                          dark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {product.grade}
                      </span>
                    )}
                  </div>

                  <div className={`space-y-1.5 text-sm mb-4 ${mutedText}`}>
                    {product.originRegion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span>{product.originRegion}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 shrink-0" />
                      <span>{farmerUser?.fullName || product.farmer?.farmName || "Unknown farmer"}</span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="text-xl font-bold text-amber-600 dark:text-amber-500">
                        ETB {(product.pricePerUnit ?? 0).toLocaleString()}
                        <span className="text-sm font-normal text-gray-500">/{product.unit || "unit"}</span>
                      </div>
                      <div className={`text-sm ${mutedText}`}>
                        {product.quantity && product.quantity > 0
                          ? `${product.quantity} ${product.unit} available`
                          : "Out of stock"}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => addToCart(row)}
                        disabled={busyId === row.productId || !product.quantity}
                        aria-label={`Add ${product.name} to cart`}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 ${
                          dark
                            ? "bg-gray-700 text-white hover:bg-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {busyId === row.productId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="w-4 h-4" />
                        )}
                        Cart
                      </button>
                      <button
                        onClick={() => removeFavorite(row)}
                        disabled={busyId === row.productId}
                        aria-label={`Remove ${product.name} from favorites`}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

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
