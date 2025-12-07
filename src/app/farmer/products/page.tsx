// app/farmer/products/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  quantity: number | string;
  price: number | string;
  category?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  products: Product[];
  stats?: {
    total_quantity: number;
    product_count: number;
    farmer_id: number;
  };
  error?: string;
  debug?: any;
}

const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

const formatNumber = (value: any, decimals: number = 2): string => {
  const num = safeNumber(value);
  return num.toFixed(decimals);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [farmerId, setFarmerId] = useState<string | null>(null);

  const getAuthHeader = () => {
    // Get session ID from localStorage
    const sessionId = localStorage.getItem("session_id");
    const authHeader = localStorage.getItem("auth_header");
    
    console.log("Auth debug:", { sessionId, authHeader });
    
    // Use either the session_id to create header or use stored auth_header
    if (authHeader) {
      return authHeader;
    } else if (sessionId) {
      return `Session ${sessionId}`;
    }
    
    return null;
  };

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from API...');
      
      // Get authentication header
      const authHeader = getAuthHeader();
      
      if (!authHeader) {
        throw new Error("Not authenticated. Please log in again.");
      }
      
      console.log('Using auth header:', authHeader.substring(0, 30) + '...');
      
      const headers = {
        "Authorization": authHeader,
        "Content-Type": "application/json"
      };
      
      const response = await fetch("/api/farmer/products", {
        headers: headers
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      
      // Check if response is HTML (error page)
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        const text = await response.text();
        console.error("Received HTML instead of JSON:", text.substring(0, 200));
        throw new Error("API returned HTML page instead of JSON. Check if API route exists.");
      }
      
      const data: ApiResponse = await response.json();
      console.log('📊 API Response:', data);
      setApiResponse(data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch: ${response.status}`);
      }

      if (data.success && data.products && Array.isArray(data.products)) {
        // Convert string quantities/prices to numbers
        const processedProducts = data.products.map(product => ({
          ...product,
          quantity: safeNumber(product.quantity),
          price: safeNumber(product.price)
        }));
        setProducts(processedProducts);
        
        // Set farmer ID from response
        if (data.stats?.farmer_id) {
          setFarmerId(data.stats.farmer_id.toString());
        }
      } else {
        throw new Error(data.error || "Invalid data format from API");
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      console.error('❌ Fetch error:', err);
      
      // Try to get farmer ID from localStorage as fallback
      const storedFarmerId = localStorage.getItem("farmer_id");
      if (storedFarmerId) {
        setFarmerId(storedFarmerId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user is authenticated before fetching
    const checkAuth = () => {
      const sessionId = localStorage.getItem("session_id");
      const userRole = localStorage.getItem("user_role");
      
      if (!sessionId) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }
      
      if (userRole !== "farmer") {
        setError("Access denied. This page is for farmers only.");
        setLoading(false);
        return;
      }
      
      // Get farmer ID from localStorage
      const storedFarmerId = localStorage.getItem("farmer_id");
      if (storedFarmerId) {
        setFarmerId(storedFarmerId);
      }
      
      fetchProducts();
    };
    
    checkAuth();
  }, []);

  // Calculate totals
  const totalValue = products.reduce((sum, product) => 
    sum + (safeNumber(product.quantity) * safeNumber(product.price)), 0);
  const totalQuantity = products.reduce((sum, product) => 
    sum + safeNumber(product.quantity), 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading your products...</p>
        <p className="text-sm text-gray-400 mt-2">Farmer ID: {farmerId || 'Loading...'}</p>
      </div>
    );
  }

  // Debug info panel
  const DebugPanel = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-700 mb-2">Debug Information:</h3>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">API Response:</span> {apiResponse?.success ? '✅ Success' : '❌ Failed'}</p>
        <p><span className="font-medium">Products Count:</span> {products.length}</p>
        <p><span className="font-medium">Farmer ID:</span> {farmerId || 'Not set'}</p>
        <p><span className="font-medium">Total Quantity:</span> {formatNumber(totalQuantity, 2)} kg</p>
        <p><span className="font-medium">Total Value:</span> ₮ {safeNumber(totalValue).toLocaleString()}</p>
        {apiResponse?.error && (
          <p className="text-red-600 font-medium">Error: {apiResponse.error}</p>
        )}
      </div>
    </div>
  );

  // Error state
  if (error && !apiResponse?.success) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Authentication Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          <DebugPanel />
          
          <div className="space-y-4 mt-6">
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/login";
              }}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Go to Login Page
            </button>
            <button
              onClick={fetchProducts}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Retry Fetch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Your Products</h1>
            <p className="text-gray-600">
              Farmer ID: <span className="font-medium">{farmerId || 'Not set'}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                console.log("Debug info:", {
                  localStorage: {
                    session_id: localStorage.getItem("session_id"),
                    farmer_id: localStorage.getItem("farmer_id"),
                    user_role: localStorage.getItem("user_role"),
                    auth_header: localStorage.getItem("auth_header")
                  },
                  apiResponse,
                  products
                });
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Debug
            </button>
          </div>
        </div>

        {/* Debug Panel */}
        {error && <DebugPanel />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-amber-700">{products.length}</p>
            <p className="text-xs text-gray-400 mt-1">In your inventory</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Total Stock</p>
            <p className="text-2xl font-bold text-amber-700">
              {formatNumber(totalQuantity, 2)} units
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all products</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Inventory Value</p>
            <p className="text-2xl font-bold text-green-700">₮ {safeNumber(totalValue).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Total value at current prices</p>
          </div>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const quantity = safeNumber(product.quantity);
              const price = safeNumber(product.price);
              const productValue = quantity * price;
              
              return (
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
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Stock:</span>
                      <span className={`font-semibold ${quantity > 0 ? 'text-green-700' : 'text-red-600'}`}>
                        {formatNumber(quantity, 2)} units
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-semibold text-amber-700">
                        ₮ {price.toLocaleString()}/unit
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-bold text-green-700">
                        ₮ {productValue.toLocaleString()}
                      </span>
                    </div>
                    
                    {product.created_at && (
                      <p className="text-xs text-gray-400">
                        Added: {new Date(product.created_at).toLocaleDateString()}
                      </p>
                    )}
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
                      Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // No products message
          <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl bg-white">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-3xl">📦</span>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-6">
              You haven't added any products yet. Start by adding your first product.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => console.log("Add product clicked")}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
              >
                Add Your First Product
              </button>
              <button
                onClick={fetchProducts}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}