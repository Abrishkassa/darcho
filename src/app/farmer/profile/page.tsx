"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface FarmerProfile {
  id: number | string;
  fullname: string;
  phone: string;
  email?: string;
  region: string;
  residence: string;
  farm_size?: string;
  years_farming?: number;
  farm_name?: string;
  certifications?: string[];
  join_date?: string;
  experience?: string;
  total_products?: number;
  total_orders?: number;
  avg_rating?: number;
  response_time_hours?: number;
  profile_image_url?: string;
}

interface Product {
  id: number | string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  description?: string;
  image_url?: string;
  created_at?: string;
}

interface ApiResponse {
  success: boolean;
  profile?: FarmerProfile;
  recent_products?: Product[];
  stats?: {
    total_products: number;
    total_orders: number;
    avg_rating: number;
  };
  error?: string;
}

export default function FarmerProfilePage() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    unit: "kg",
    description: ""
  });

  const router = useRouter();

  // Get authentication headers
  const getAuthHeaders = (): HeadersInit => {
    const authHeader = localStorage.getItem("auth_header");
    const sessionId = localStorage.getItem("session_id");
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (authHeader) {
      headers["Authorization"] = authHeader;
    } else if (sessionId) {
      headers["Authorization"] = `Session ${sessionId}`;
    }
    
    return headers;
  };

  // Check if user is authenticated
  const checkAuth = (): boolean => {
    const sessionId = localStorage.getItem("session_id");
    const userRole = localStorage.getItem("user_role");
    
    if (!sessionId || userRole !== "farmer") {
      return false;
    }
    return true;
  };

  // Load farmer profile
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      
      // First check authentication
      if (!checkAuth()) {
        setError("You are not logged in. Please log in first.");
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/farmer/profile", {
        headers: getAuthHeaders(),
      });
      
      console.log("Profile response status:", res.status);
      
      // Handle unauthorized
      if (res.status === 401) {
        localStorage.clear();
        router.push("/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data: ApiResponse = await res.json();
      console.log("Profile API response:", data);

      if (data.success && data.profile) {
        setProfile(data.profile);
        
        // If API returns recent products, use them
        if (data.recent_products && Array.isArray(data.recent_products)) {
          setProducts(data.recent_products);
        }
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      console.error("Profile loading error:", err);
      
      // For development: create mock profile if API fails
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock profile for development");
        setProfile({
          id: 1,
          fullname: "Abriham Kassa",
          phone: "+251 972 590 743",
          email: "abrihamkassa323@gmial.com",
          region: "Oromia",
          residence: "Addis Ababa",
          farm_size: "5 hectares",
          years_farming: 8,
          farm_name: "Green Valley Farm",
          certifications: ["Organic Certified", "Fair Trade", "Rainforest Alliance"],
          join_date: new Date().toISOString(),
          experience: "8 years",
          total_products: 8,
          total_orders: 24,
          avg_rating: 4.8,
          response_time_hours: 2,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Load products separately
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/farmer/products", {
        headers: getAuthHeaders(),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.success && data.products) {
        // Ensure price is a number for all products
        const validatedProducts = data.products.map((product: any) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : 
                 typeof product.price === 'number' ? product.price : 0,
          quantity: typeof product.quantity === 'string' ? parseFloat(product.quantity) || 0 : 
                   typeof product.quantity === 'number' ? product.quantity : 0,
          unit: product.unit || 'kg'
        }));
        setProducts(validatedProducts);
      } else if (data && Array.isArray(data)) {
        // If data is array directly
        const validatedProducts = data.map((product: any) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : 
                 typeof product.price === 'number' ? product.price : 0,
          quantity: typeof product.quantity === 'string' ? parseFloat(product.quantity) || 0 : 
                   typeof product.quantity === 'number' ? product.quantity : 0,
          unit: product.unit || 'kg'
        }));
        setProducts(validatedProducts);
      }
    } catch (err: unknown) {
      console.error("Failed to load products:", err);
      // Keep existing products if any
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    // Add a small delay to ensure localStorage is set after login
    const timer = setTimeout(() => {
      loadProfile();
      loadProducts();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: keyof FarmerProfile, value: string | number | string[]) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      const res = await fetch("/api/farmer/profile", {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.clear();
          router.push("/login");
          return;
        }
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      
      if (data.success) {
        setIsEditing(false);
        // Update profile with returned data
        if (data.profile) {
          setProfile(data.profile);
        }
        alert("Profile updated successfully!");
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      alert("Error: " + errorMessage);
    }
  };

  const handleAddProduct = async () => {
    try {
      // Get farmer ID from localStorage or profile
      const farmerId = localStorage.getItem("farmer_id") || profile?.id;
      
      if (!farmerId) {
        throw new Error("Farmer ID not found. Please login again.");
      }
      
      const productData = {
        ...newProduct,
        farmerId: farmerId,
      };
      
      const res = await fetch("/api/farmer/products", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        throw new Error("Failed to add product");
      }

      setIsAddingProduct(false);
      setNewProduct({
        name: "",
        category: "",
        price: 0,
        quantity: 0,
        unit: "kg",
        description: ""
      });
      
      // Reload both profile and products
      loadProfile();
      loadProducts();
      alert("Product added successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add product";
      setError(errorMessage);
      alert("Error: " + errorMessage);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const res = await fetch(`/api/farmer/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(editingProduct),
      });

      if (!res.ok) {
        throw new Error("Failed to update product");
      }

      setEditingProduct(null);
      loadProducts();
      alert("Product updated successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product";
      setError(errorMessage);
      alert("Error: " + errorMessage);
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/farmer/products?id=${productId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      loadProducts();
      alert("Product deleted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMessage);
      alert("Error: " + errorMessage);
    }
  };

  const handleProductInputChange = (field: keyof Product, value: string | number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
      });
    } else {
      setNewProduct({
        ...newProduct,
        [field]: field === 'price' || field === 'quantity' ? Number(value) : value,
      });
    }
  };

  // Helper function to safely format price
  const formatPrice = (price: any): string => {
    if (price === null || price === undefined) return "0.00";
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    if (isNaN(numPrice)) return "0.00";
    
    return numPrice.toFixed(2);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mb-4"></div>
        <p className="text-lg text-gray-600">Loading profile...</p>
        <p className="text-sm text-gray-400 mt-2">Fetching your information...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Try Again
            </button>
            <button
              onClick={handleLoginRedirect}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition ml-2"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
            <span className="text-3xl">👨‍🌾</span>
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">No Profile Found</h2>
          <p className="text-gray-600 mb-4">Please create your farmer profile</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-yellow-800">Debug Mode - Session: {localStorage.getItem("session_id")?.substring(0, 10)}...</span>
              <button
                onClick={() => {
                  console.log("Profile data:", profile);
                  console.log("Products:", products);
                  console.log("LocalStorage:", {
                    session_id: localStorage.getItem("session_id"),
                    farmer_id: localStorage.getItem("farmer_id"),
                    user_role: localStorage.getItem("user_role"),
                  });
                }}
                className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded"
              >
                Show Data
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Farmer Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddingProduct(true)}
              className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
            >
              + Add Product
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-5 py-2 rounded-lg font-medium transition ${
                isEditing
                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>

        {error && !isEditing && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amber-100">
              {/* Profile Header */}
              <div className="bg-amber-800 text-white p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-amber-800 text-3xl">
                    {profile.profile_image_url ? (
                      <img 
                        src={profile.profile_image_url} 
                        alt={profile.fullname}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      "👨‍🌾"
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.fullname}</h2>
                    <p className="text-amber-200">Farmer Account</p>
                    {profile.farm_name && (
                      <p className="text-amber-200">{profile.farm_name}</p>
                    )}
                    {profile.join_date && (
                      <p className="text-sm text-amber-300 mt-1">
                        Member since {new Date(profile.join_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">
                  Personal Information
                </h3>

                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.fullname}
                          onChange={(e) => handleInputChange("fullname", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900 font-medium">{profile.fullname}</p>
                      )}
                    </div>
                  </div>

                  {/* Farm Name */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Farm Name</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.farm_name || ""}
                          onChange={(e) => handleInputChange("farm_name", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="Enter farm name"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.farm_name || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="email"
                          value={profile.email || ""}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="Add your email"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.email || "Not provided"}</p>
                      )}
                    </div>
                  </div>

                  {/* Region */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <select
                          value={profile.region}
                          onChange={(e) => handleInputChange("region", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        >
                          <option value="Oromia">Oromia</option>
                          <option value="Amhara">Amhara</option>
                          <option value="SNNPR">SNNPR</option>
                          <option value="Tigray">Tigray</option>
                          <option value="Somali">Somali</option>
                          <option value="Afar">Afar</option>
                          <option value="Addis Ababa">Addis Ababa</option>
                        </select>
                      ) : (
                        <p className="text-lg text-gray-900">{profile.region}</p>
                      )}
                    </div>
                  </div>

                  {/* Residence */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Residence</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.residence}
                          onChange={(e) => handleInputChange("residence", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.residence}</p>
                      )}
                    </div>
                  </div>

                  {/* Farm Size */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Farm Size</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profile.farm_size || ""}
                          onChange={(e) => handleInputChange("farm_size", e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., 5 hectares"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">{profile.farm_size || "Not specified"}</p>
                      )}
                    </div>
                  </div>

                  {/* Years Farming */}
                  <div className="flex flex-col md:flex-row md:items-center">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Years Farming</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <input
                          type="number"
                          value={profile.years_farming || ""}
                          onChange={(e) => handleInputChange("years_farming", parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          placeholder="e.g., 10"
                        />
                      ) : (
                        <p className="text-lg text-gray-900">
                          {profile.years_farming ? `${profile.years_farming} years` : "Not specified"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="flex flex-col md:flex-row md:items-start">
                    <div className="md:w-1/3 mb-2 md:mb-0">
                      <label className="block text-sm font-medium text-gray-700">Certifications</label>
                    </div>
                    <div className="md:w-2/3">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={profile.certifications?.join(", ") || ""}
                            onChange={(e) => handleInputChange("certifications", e.target.value.split(", "))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            placeholder="Organic, Fair Trade, Rainforest Alliance"
                          />
                          <p className="text-xs text-gray-500">Separate with commas</p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {profile.certifications && profile.certifications.length > 0 ? (
                            profile.certifications.map((cert, index) => (
                              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                {cert}
                              </span>
                            ))
                          ) : (
                            <p className="text-gray-500">No certifications</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Save Button for Edit Mode */}
                {isEditing && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSaveProfile}
                      className="w-full md:w-auto px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
                    >
                      <span>💾</span>
                      <span>Save Changes</span>
                    </button>
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Click save to update your profile information
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="mt-8 bg-white shadow-xl rounded-2xl overflow-hidden border border-amber-100">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">My Products</h3>
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                    {products.length} items
                  </span>
                </div>

                {loadingProducts ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                    <p className="ml-3 text-gray-600">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-2xl">🌾</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-700 mb-2">No Products Yet</h4>
                    <p className="text-gray-500 mb-4">Add your first product to start selling</p>
                    <button
                      onClick={() => setIsAddingProduct(true)}
                      className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
                    >
                      Add Your First Product
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-medium text-gray-900">{product.name}</h4>
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {product.category}
                              </span>
                            </div>
                            <p className="text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                            <div className="flex items-center space-x-6 mt-3">
                              <span className="text-amber-700 font-bold">
                                ETB {formatPrice(product.price)} per {product.unit || 'kg'}
                              </span>
                              <span className="text-gray-700">
                                Quantity: {product.quantity} {product.unit || 'kg'}
                              </span>
                              {product.created_at && (
                                <span className="text-sm text-gray-500">
                                  Added: {new Date(product.created_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Stats</h3>
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">Account Type</p>
                  <p className="text-xl font-bold text-amber-700">Verified Farmer</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-xl font-bold text-green-700">
                    {profile.total_products || products.length}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-xl font-bold text-blue-700">
                    {profile.total_orders || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-xl font-bold text-purple-700">
                    {profile.avg_rating ? `${profile.avg_rating}/5` : "No ratings yet"}
                  </p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Response Time</p>
                  <p className="text-xl font-bold text-indigo-700">
                    {profile.response_time_hours ? `< ${profile.response_time_hours}h` : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => router.push('/farmer/orders')}
                  className="w-full text-left px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition"
                >
                  View Orders
                </button>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  Add New Product
                </button>
                <button 
                  onClick={() => router.push('/farmer/insights')}
                  className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  View Analytics
                </button>
                <button className="w-full text-left px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                  Help & Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add New Product</h3>
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => handleProductInputChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Yirgacheffe AA Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => handleProductInputChange("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Specialty Coffee">Specialty Coffee</option>
                    <option value="Arabica">Arabica</option>
                    <option value="Robusta">Robusta</option>
                    <option value="Organic Coffee">Organic Coffee</option>
                    <option value="Fair Trade">Fair Trade</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => handleProductInputChange("price", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={newProduct.unit}
                      onChange={(e) => handleProductInputChange("unit", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="bag">bag</option>
                      <option value="sack">sack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => handleProductInputChange("quantity", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="0"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => handleProductInputChange("description", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                    placeholder="Describe your product (grade, processing method, tasting notes, etc.)"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddingProduct(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Edit Product</h3>
                <button
                  onClick={() => setEditingProduct(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={(e) => handleProductInputChange("name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => handleProductInputChange("category", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  >
                    <option value="Specialty Coffee">Specialty Coffee</option>
                    <option value="Arabica">Arabica</option>
                    <option value="Robusta">Robusta</option>
                    <option value="Organic Coffee">Organic Coffee</option>
                    <option value="Fair Trade">Fair Trade</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETB)</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => handleProductInputChange("price", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                      value={editingProduct.unit}
                      onChange={(e) => handleProductInputChange("unit", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lb">lb</option>
                      <option value="bag">bag</option>
                      <option value="sack">sack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editingProduct.quantity}
                    onChange={(e) => handleProductInputChange("quantity", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    min="0"
                    step="0.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingProduct.description || ""}
                    onChange={(e) => handleProductInputChange("description", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProduct}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Product
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}