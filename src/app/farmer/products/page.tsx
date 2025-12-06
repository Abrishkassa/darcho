// app/farmer/products/page.tsx
"use client";

import { useEffect, useState } from "react";

interface Product {
  id: number;
  name: string;
  quantity: number | string; // Can be string from MySQL DECIMAL
  price: number | string;    // Can be string from MySQL DECIMAL
  category?: string;
  description?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse {
  success: boolean;
  products: Product[];
  count: number;
  farmerId?: string;
  error?: string;
  debug?: any;
  isMockData?: boolean;
}

// Helper function to safely convert to number
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// Helper function to format numbers
const formatNumber = (value: any, decimals: number = 2): string => {
  const num = safeNumber(value);
  return num.toFixed(decimals);
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);

  const fetchProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products from API...');
      const response = await fetch("/api/farmer/products");
      console.log('📡 Response status:', response.status, response.statusText);
      
      const data: ApiResponse = await response.json();
      console.log('📊 API Response:', data);
      setApiResponse(data);
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to fetch: ${response.status}`);
      }

      if (data.products && Array.isArray(data.products)) {
        // Convert string quantities/prices to numbers
        const processedProducts = data.products.map(product => ({
          ...product,
          quantity: safeNumber(product.quantity),
          price: safeNumber(product.price)
        }));
        setProducts(processedProducts);
      } else if (Array.isArray(data)) {
        setProducts(data);
      } else {
        throw new Error("Invalid data format from API");
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch products";
      setError(errorMessage);
      console.error('❌ Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Calculate totals - using safeNumber to handle strings
  const totalValue = products.reduce((sum, product) => 
    sum + (safeNumber(product.quantity) * safeNumber(product.price)), 0);
  const totalQuantity = products.reduce((sum, product) => 
    sum + safeNumber(product.quantity), 0);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading products from database...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching from MySQL...</p>
        <button 
          onClick={() => fetchProducts()}
          className="mt-4 px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          Force Refresh
        </button>
      </div>
    );
  }

  // Debug info panel
  const DebugPanel = () => (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-medium text-gray-700 mb-2">Debug Information:</h3>
      <div className="text-sm space-y-1">
        <p><span className="font-medium">API Response:</span> {apiResponse?.success ? '✅ Success' : '❌ Failed'}</p>
        <p><span className="font-medium">Products Count:</span> {apiResponse?.count || 0}</p>
        <p><span className="font-medium">Farmer ID:</span> {apiResponse?.farmerId || 'Not set'}</p>
        <p><span className="font-medium">Total Quantity Type:</span> {typeof totalQuantity}</p>
        <p><span className="font-medium">Total Quantity Value:</span> {totalQuantity}</p>
        {apiResponse?.isMockData && (
          <p className="text-amber-600 font-medium">⚠️ Using mock data (database issue)</p>
        )}
        {apiResponse?.debug && (
          <details className="mt-2">
            <summary className="cursor-pointer text-blue-600">View Debug Details</summary>
            <pre className="mt-2 p-2 bg-gray-800 text-gray-100 rounded text-xs overflow-auto">
              {JSON.stringify(apiResponse.debug, null, 2)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );

  // Error state
  if (error && !apiResponse?.products?.length) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Database Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          
          <DebugPanel />
          
          <div className="space-x-4 mt-4">
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

  // No products state (but API succeeded)
  if (apiResponse?.success && (!products || products.length === 0)) {
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
        
        <DebugPanel />
        
        <div className="text-center py-16 border-2 border-dashed border-amber-200 rounded-xl">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-xl text-gray-600 font-medium mb-2">No products in database</p>
          <p className="text-gray-500 mb-6">Your products table is empty or contains no matching records.</p>
          <p className="text-sm text-gray-400 mb-4">Farmer ID: {apiResponse?.farmerId || 'Unknown'}</p>
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
    <div className="min-h-screen bg-amber-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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
            <button
              onClick={() => console.log('Current state:', { products, apiResponse, error, totalQuantity, totalValue })}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Log State
            </button>
          </div>
        </div>

        {/* Debug Panel - Always show if there's debug info */}
        {apiResponse?.debug && <DebugPanel />}

        {/* Error banner (if error but we still have products) */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
            <div className="mt-2 text-sm text-red-600">
              Showing cached products. Make sure:
              <ul className="list-disc ml-5 mt-1">
                <li>MySQL database is running</li>
                <li>Products table exists</li>
                <li>You have products with farmer_id = {apiResponse?.farmerId || 1}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mock Data Warning */}
        {apiResponse?.isMockData && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-amber-600 mr-2">⚠️</span>
              <p className="text-amber-700 font-medium">Showing mock data - Database connection failed</p>
            </div>
            <p className="text-sm text-amber-600 mt-1">
              Check your MySQL connection and make sure the products table exists.
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Total Products</p>
            <p className="text-2xl font-bold text-amber-700">{products.length}</p>
            {apiResponse?.farmerId && (
              <p className="text-xs text-gray-400 mt-1">Farmer ID: {apiResponse.farmerId}</p>
            )}
          </div>
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Total Stock</p>
            <p className="text-2xl font-bold text-amber-700">
              {formatNumber(totalQuantity, 2)} kg
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all products</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow border border-amber-100">
            <p className="text-gray-600 text-sm">Total Value</p>
            <p className="text-2xl font-bold text-green-700">₮ {safeNumber(totalValue).toLocaleString()}</p>
            <p className="text-xs text-gray-400 mt-1">Current inventory value</p>
          </div>
        </div>

        {/* Products Grid */}
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
                      {formatNumber(quantity, 2)} kg
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-amber-700">₮ {price.toLocaleString()}/kg</span>
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
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Database Setup Instructions (shown when no products) */}
        {products.length === 0 && !error && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="font-bold text-blue-800 mb-3">Database Setup Required</h3>
            <p className="text-blue-700 mb-4">To display products, you need to:</p>
            <div className="bg-gray-800 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <code>
                -- 1. Create products table<br/>
                CREATE TABLE products (<br/>
                &nbsp;&nbsp;id INT PRIMARY KEY AUTO_INCREMENT,<br/>
                &nbsp;&nbsp;farmer_id INT NOT NULL,<br/>
                &nbsp;&nbsp;name VARCHAR(255) NOT NULL,<br/>
                &nbsp;&nbsp;quantity DECIMAL(10,2) NOT NULL DEFAULT 0,<br/>
                &nbsp;&nbsp;price DECIMAL(10,2) NOT NULL,<br/>
                &nbsp;&nbsp;category VARCHAR(100),<br/>
                &nbsp;&nbsp;description TEXT,<br/>
                &nbsp;&nbsp;created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br/>
                );<br/><br/>
                
                -- 2. Insert test data for farmer_id = 1<br/>
                INSERT INTO products (farmer_id, name, quantity, price, category) VALUES<br/>
                &nbsp;&nbsp;(1, 'Coffee Beans', 50, 1200, 'Coffee'),<br/>
                &nbsp;&nbsp;(1, 'Tea Leaves', 30, 800, 'Tea'),<br/>
                &nbsp;&nbsp;(1, 'Honey', 20, 1500, 'Sweetener');<br/>
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}