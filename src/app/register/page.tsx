"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "farmer", // or "buyer"
    // Farmer specific
    farmName: "",
    region: "",
    residence: "",
    // Buyer specific
    companyName: "",
    businessType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        
        // Auto-login after registration
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-emerald-50/20 to-green-50/20 -skew-y-6 transform -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-l from-amber-50/10 to-orange-50/10 skew-y-6 transform translate-y-48"></div>

      <div className="relative w-full max-w-4xl">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Darcho Marketplace</h1>
          <p className="text-gray-600">Create your account to start trading coffee directly</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="md:flex">
            {/* Left side - Form */}
            <div className="md:w-1/2 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                <p className="text-gray-600 text-sm mt-1">Fill in your details to get started</p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">I want to join as</label>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: "farmer" }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${formData.role === "farmer" 
                        ? "border-green-500 bg-green-50 text-green-700 shadow-sm" 
                        : "border-gray-200 hover:border-green-300 text-gray-700"}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "farmer" ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                        {formData.role === "farmer" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-medium">Farmer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, role: "buyer" }))}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${formData.role === "buyer" 
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" 
                        : "border-gray-200 hover:border-blue-300 text-gray-700"}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.role === "buyer" ? "border-blue-500 bg-blue-500" : "border-gray-300"}`}>
                        {formData.role === "buyer" && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="font-medium">Buyer</span>
                    </button>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-1">
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                      placeholder="John Doe"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path>
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                        placeholder="you@example.com"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                        </svg>
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                        placeholder="+1234567890"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                        placeholder="At least 6 characters"
                        disabled={loading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                        placeholder="Re-enter your password"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Role-specific fields */}
                {formData.role === 'farmer' && (
                  <div className="space-y-4 p-4 bg-green-50/50 border border-green-100 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"></path>
                        </svg>
                      </div>
                      <h3 className="font-medium text-green-800">Farmer Details</h3>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="farmName" className="block text-sm font-medium text-gray-700">
                        Farm Name (Optional)
                      </label>
                      <input
                        id="farmName"
                        name="farmName"
                        type="text"
                        value={formData.farmName}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all duration-200"
                        placeholder="Your farm name"
                        disabled={loading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                          Region *
                        </label>
                        <input
                          id="region"
                          name="region"
                          type="text"
                          required
                          value={formData.region}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all duration-200"
                          placeholder="Coffee growing region"
                          disabled={loading}
                        />
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="residence" className="block text-sm font-medium text-gray-700">
                          Residence *
                        </label>
                        <input
                          id="residence"
                          name="residence"
                          type="text"
                          required
                          value={formData.residence}
                          onChange={handleChange}
                          className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all duration-200"
                          placeholder="Your current residence"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.role === 'buyer' && (
                  <div className="space-y-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      </div>
                      <h3 className="font-medium text-blue-800">Business Details</h3>
                    </div>
                    
                    <div className="space-y-1">
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                        Company Name (Optional)
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200"
                        placeholder="Your company name"
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                        Business Type
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        value={formData.businessType}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all duration-200 bg-white"
                        disabled={loading}
                      >
                        <option value="">Select business type</option>
                        <option value="roaster">Coffee Roaster</option>
                        <option value="retailer">Retailer</option>
                        <option value="exporter">Exporter</option>
                        <option value="importer">Importer</option>
                        <option value="cafe">Cafe/Restaurant</option>
                        <option value="wholesaler">Wholesaler</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                      </svg>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-gray-600 text-sm">
                  Already have an account?{" "}
                  <a href="/login" className="font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200">
                    Sign in here
                  </a>
                </p>
              </div>
            </div>

            {/* Right side - Info */}
            <div className="md:w-1/2 bg-gradient-to-br from-amber-500 to-orange-500 p-8 text-white relative">
              {/* Decorative pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
              
              <div className="relative h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6">Join the Coffee Revolution</h3>
                <p className="text-white/90 mb-8">
                  Become part of the fastest-growing direct trade coffee marketplace connecting farmers and buyers worldwide.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Better Prices</h4>
                      <p className="text-sm text-white/80">Farmers earn 20-40% more, buyers save 15-30% on premium beans</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Global Network</h4>
                      <p className="text-sm text-white/80">Connect with verified partners across 50+ countries</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Secure Platform</h4>
                      <p className="text-sm text-white/80">Escrow payments, quality verification, and secure contracts</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Market Insights</h4>
                      <p className="text-sm text-white/80">Real-time analytics, pricing trends, and quality scores</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/80 text-center">
                    Already helping 5,000+ farmers and 2,000+ buyers trade directly
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Darcho - Coffee Marketplace. All rights reserved.
          </p>
          <div className="mt-4 flex items-center justify-center space-x-4">
            <a href="/privacy" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
              Privacy Policy
            </a>
            <span className="text-gray-300">•</span>
            <a href="/terms" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
              Terms of Service
            </a>
            <span className="text-gray-300">•</span>
            <a href="/contact" className="text-gray-500 hover:text-gray-700 text-sm transition-colors duration-200">
              Contact
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}