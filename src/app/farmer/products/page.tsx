"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Loader2,
  Pencil,
  Trash2,
  X,
  Coffee,
  AlertTriangle,
} from "lucide-react";
import { useFarmerTheme } from "@/app/farmer/theme-context";
import ProductImageUploader from "@/app/farmer/components/ProductImageUploader";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  unit: string;
  category?: string;
  description?: string;
  image_url?: string | null;
  grade?: string;
  origin?: string;
  status?: string;
  created_at?: string;
}

interface ProductFormState {
  name: string;
  category: string;
  grade: string;
  quantity: string;
  price: string;
  unit: string;
  origin: string;
  description: string;
  imageUrl: string | null;
}

const EMPTY_FORM: ProductFormState = {
  name: "",
  category: "",
  grade: "A",
  quantity: "",
  price: "",
  unit: "kg",
  origin: "",
  description: "",
  imageUrl: null,
};

const CATEGORIES = [
  "Specialty Coffee",
  "Arabica",
  "Robusta",
  "Organic Coffee",
  "Fair Trade",
  "Other",
];

function toForm(product: Product): ProductFormState {
  return {
    name: product.name || "",
    category: product.category || "",
    grade: product.grade || "A",
    quantity: String(product.quantity ?? ""),
    price: String(product.price ?? ""),
    unit: product.unit || "kg",
    origin: product.origin || "",
    description: product.description || "",
    imageUrl: product.image_url || null,
  };
}

export default function FarmerProductsPage() {
  const { dark } = useFarmerTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Modal state — `editing` holds the product being changed, or null for "new".
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/farmer/products");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load products");
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.origin || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
  const inventoryValue = products.reduce(
    (sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.price) || 0),
    0
  );

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm(toForm(product));
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
    setEditing(null);
    setFormError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.category || !form.quantity || !form.price) {
      setFormError("Name, category, quantity and price are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      name: form.name.trim(),
      category: form.category,
      grade: form.grade || "A",
      quantity: form.quantity,
      price: form.price,
      unit: form.unit,
      origin: form.origin || "Ethiopia",
      description: form.description,
      image_url: form.imageUrl,
    };

    try {
      const res = await fetch(
        editing ? `/api/farmer/products?id=${editing.id}` : "/api/farmer/products",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Request failed");

      await loadProducts();
      setModalOpen(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      const res = await fetch(`/api/farmer/products?id=${product.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete");
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const card = `rounded-2xl border shadow-sm ${dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white"}`;
  const muted = dark ? "text-gray-400" : "text-gray-600";
  const heading = dark ? "text-white" : "text-gray-900";
  const inputClass = `w-full px-4 py-2.5 rounded-lg border ${
    dark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300"
  } focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${heading}`}>Your Products</h1>
          <p className={`mt-1 ${muted}`}>Manage your coffee listings and inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
              className={`${inputClass} pl-9`}
            />
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Total Products</div>
          <div className={`text-2xl font-bold ${heading}`}>{products.length}</div>
        </div>
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Total Stock</div>
          <div className={`text-2xl font-bold ${heading}`}>
            {totalStock.toLocaleString()} kg
          </div>
        </div>
        <div className={`p-5 ${card}`}>
          <div className={`text-sm ${muted}`}>Inventory Value</div>
          <div className="text-2xl font-bold text-emerald-600">
            ETB {inventoryValue.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-amber-600 animate-spin mb-4" />
          <p className={muted}>Loading your products…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`p-16 rounded-2xl border text-center ${card}`}>
          <Package className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className={`text-lg font-medium mb-1 ${heading}`}>
            {products.length === 0 ? "No products yet" : "No matches"}
          </p>
          <p className={`mb-6 ${muted}`}>
            {products.length === 0
              ? "Add your first coffee listing to start selling."
              : "Try a different search term."}
          </p>
          {products.length === 0 && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filtered.map((product) => (
            <div key={product.id} className={`rounded-2xl border overflow-hidden shadow-sm ${card}`}>
              {product.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image_url}
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
                  <h2 className={`font-bold text-lg leading-tight ${heading}`}>{product.name}</h2>
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

                {product.category && (
                  <p className={`text-sm mb-2 ${muted}`}>
                    {product.category}
                    {product.origin ? ` · ${product.origin}` : ""}
                  </p>
                )}

                {product.description && (
                  <p className={`text-sm mb-3 line-clamp-2 ${muted}`}>{product.description}</p>
                )}

                <div className={`flex items-center justify-between text-sm mb-4 ${muted}`}>
                  <span>
                    Stock:{" "}
                    <span className={Number(product.quantity) > 0 ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                      {product.quantity} {product.unit}
                    </span>
                  </span>
                  <span className={`font-semibold ${heading}`}>
                    ETB {Number(product.price).toLocaleString()}/{product.unit}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${
                      dark ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product)}
                    disabled={deletingId === product.id}
                    aria-label={`Delete ${product.name}`}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === product.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Edit product" : "Add product"}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 ${
              dark ? "bg-gray-900" : "bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl font-bold ${heading}`}>
                {editing ? "Edit Product" : "Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                aria-label="Close"
                className={`p-2 rounded-lg ${dark ? "hover:bg-gray-800" : "hover:bg-gray-100"} transition-colors`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4">
              <ProductImageUploader
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
              />

              <div>
                <label className={`block text-sm font-medium mb-1 ${heading}`}>Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Yirgacheffe AA"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Grade</label>
                  <input
                    type="text"
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    placeholder="A"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Quantity *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className={inputClass}
                  >
                    {["kg", "g", "lb", "bag", "sack"].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Price per unit (ETB) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${heading}`}>Origin Region</label>
                  <input
                    type="text"
                    value={form.origin}
                    onChange={(e) => setForm({ ...form, origin: e.target.value })}
                    placeholder="e.g. Yirgacheffe"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${heading}`}>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Grade, processing method, tasting notes…"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={closeModal}
                disabled={submitting}
                className={`w-full sm:flex-1 py-2.5 rounded-lg border font-medium transition-colors ${
                  dark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-800"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? "Saving…" : editing ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
