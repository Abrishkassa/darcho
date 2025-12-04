// app/farmer/products/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  quantity: number;
  price: number;
  category?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/farmer/products");
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error("Invalid data format");
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate totals
  const totalValue = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading products from database...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching from MySQL...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Database Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={fetchProducts}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No products state
  if (products.length === 0) {
    return (
      <div className="min-h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-amber-900">Your Products</h1>
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Refresh Products
          </button>
        </div>
        
        <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-xl text-gray-600 font-medium mb-2">No products in database</p>
          <p className="text-gray-500 mb-6">Your products table is empty or contains no matching records.</p>
          <button
            onClick={fetchProducts}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Refresh List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Your Products</h1>
          <p className="text-gray-600">From MySQL database</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Total Products</p>
          <p className="text-2xl font-bold text-amber-700">{products.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Total Stock</p>
          <p className="text-2xl font-bold text-amber-700">{totalQuantity} kg</p>
        </div>
        <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
          <p className="text-gray-600 text-sm">Total Value</p>
          <p className="text-2xl font-bold text-green-700">₮ {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="p-5 bg-white shadow-lg rounded-xl border border-amber-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-xl text-amber-900">{product.name}</h3>
                {product.category && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">ID: {product.id}</span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Stock:</span>
                <span className={`font-semibold ${product.quantity > 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {product.quantity} kg
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-semibold text-amber-700">₮ {product.price.toLocaleString()}/kg</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Value:</span>
                <span className="font-bold text-green-700">
                  ₮ {(product.quantity * product.price).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button 
                onClick={() => console.log("Edit", product.id)}
                className="flex-1 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition text-sm font-medium"
              >
                Edit
              </button>
              <button 
                onClick={() => console.log("View", product.id)}
                className="flex-1 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}