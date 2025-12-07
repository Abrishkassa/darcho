"use client";

import { useEffect, useState } from "react";

interface FarmerProfile {
  id: number | string;
  fullname: string;
  phone: string;
  email?: string;
  region: string;
  residence: string;
  farm_size?: string;
  years_farming?: number;
  joined_date?: string;
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

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/farmer/profile");
        
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const data = await res.json();

        // Handle different response formats
        if (data.profile) {
          setProfile(data.profile);
        } else if (data) {
          setProfile(data);
        } else {
          throw new Error("No profile data received");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await fetch("/api/farmer/products");
      
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      
      const data = await res.json();

      if (data.products) {
        // Ensure price is a number for all products
        const validatedProducts = data.products.map((product: any) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : 
                 typeof product.price === 'number' ? product.price : 0,
          quantity: typeof product.quantity === 'string' ? parseInt(product.quantity) || 0 : 
                   typeof product.quantity === 'number' ? product.quantity : 0,
          unit: product.unit || 'kg'
        }));
        setProducts(validatedProducts);
      } else if (data) {
        // If data is array directly
        const validatedProducts = Array.isArray(data) ? data.map((product: any) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) || 0 : 
                 typeof product.price === 'number' ? product.price : 0,
          quantity: typeof product.quantity === 'string' ? parseInt(product.quantity) || 0 : 
                   typeof product.quantity === 'number' ? product.quantity : 0,
          unit: product.unit || 'kg'
        })) : [];
        setProducts(validatedProducts);
      }
    } catch (err: unknown) {
      console.error("Failed to load products:", err);
      setProducts([]); // Set empty array on error
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      const res = await fetch("/api/farmer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      setIsEditing(false);
      // Show success message
      alert("Profile updated successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
    }
  };

  const handleAddProduct = async () => {
    try {
      const res = await fetch("/api/farmer/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
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
      
      loadProducts();
      alert("Product added successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add product";
      setError(errorMessage);
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const res = await fetch(`/api/farmer/products?id=${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
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
    }
  };

  const handleDeleteProduct = async (productId: number | string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      const res = await fetch(`/api/farmer/products?id=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete product");
      }

      loadProducts();
      alert("Product deleted successfully!");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMessage);
    }
  };

  const handleInputChange = (field: keyof FarmerProfile, value: string) => {
    if (profile) {
      setProfile({
        ...profile,
        [field]: value,
      });
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-amber-100">
              {/* Profile Header */}
              <div className="bg-amber-800 text-white p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-amber-800 text-3xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile.fullname}</h2>
                    <p className="text-amber-200">Farmer Account</p>
                    {profile.joined_date && (
                      <p className="text-sm text-amber-300 mt-1">
                        Member since {new Date(profile.joined_date).toLocaleDateString()}
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
                          onChange={(e) => handleInputChange("years_farming", e.target.value)}
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
                  <p className="text-xl font-bold text-green-700">{products.length}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Region</p>
                  <p className="text-xl font-bold text-blue-700">{profile.region}</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="text-xl font-bold text-purple-700">
                    {profile.joined_date 
                      ? new Date(profile.joined_date).toLocaleDateString()
                      : "Recently"
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow-xl rounded-2xl p-6 border border-amber-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition">
                  View Orders
                </button>
                <button 
                  onClick={() => setIsAddingProduct(true)}
                  className="w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                >
                  Add New Product
                </button>
                <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition">
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
                    placeholder="e.g., Fresh Tomatoes"
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
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Livestock">Livestock</option>
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
                      <option value="piece">piece</option>
                      <option value="liter">liter</option>
                      <option value="dozen">dozen</option>
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => handleProductInputChange("description", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    rows={3}
                    placeholder="Describe your product..."
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
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Grains">Grains</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Livestock">Livestock</option>
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
                      <option value="piece">piece</option>
                      <option value="liter">liter</option>
                      <option value="dozen">dozen</option>
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