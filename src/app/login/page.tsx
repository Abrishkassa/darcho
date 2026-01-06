"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate email
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error);
        return;
      }

      // Fetch session to determine role
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();

      const role = session?.user?.role;

      // Redirect based on role
      if (role === "buyer") {
        router.push("/buyer/dashboard");
      } else if (role === "farmer") {
        router.push("/farmer/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Test login function
  const handleTestLogin = async (role: 'farmer' | 'buyer' | 'admin') => {
    setLoading(true);
    setError("");
    
    try {
      let testCredentials;
      switch(role) {
        case 'farmer':
          testCredentials = { email: 'farmer@darcho.com', password: 'farmer123' };
          break;
        case 'buyer':
          testCredentials = { email: 'buyer@darcho.com', password: 'buyer123' };
          break;
        case 'admin':
          testCredentials = { email: 'admin@darcho.com', password: 'admin123' };
          break;
        default:
          testCredentials = { email: 'test@darcho.com', password: 'test123' };
      }
      
      setEmail(testCredentials.email);
      setPassword(testCredentials.password);
      
      // Simulate typing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await signIn("credentials", {
        email: testCredentials.email,
        password: testCredentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError(`Test ${role} login failed. Please ensure test user exists.`);
        return;
      }

      // Fetch session and redirect
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const userRole = session?.user?.role || role;

      if (userRole === "buyer") {
        router.push("/buyer/dashboard");
      } else if (userRole === "farmer") {
        router.push("/farmer/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
      
      router.refresh();
    } catch (err: any) {
      setError("Test login error. Make sure backend is running.");
      console.error("Test login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-r from-amber-50/20 to-orange-50/20 -skew-y-6 transform -translate-y-48"></div>
      <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-l from-amber-50/10 to-orange-50/10 skew-y-6 transform translate-y-48"></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Darcho</h1>
          <p className="text-gray-600">Direct farmer-buyer coffee marketplace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Test Login Buttons (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 space-y-3">
              <p className="text-sm text-gray-600 text-center">Test Accounts:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTestLogin('farmer')}
                  disabled={loading}
                  className="py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Farmer
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('buyer')}
                  disabled={loading}
                  className="py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => handleTestLogin('admin')}
                  disabled={loading}
                  className="py-2 px-4 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow"
                >
                  Admin
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                These buttons only appear in development mode
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                  placeholder="farmer@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="/forgot-password" className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200">
                  Forgot password?
                </a>
              </div>
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent focus:outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 bg-gray-50/50"
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
            </div>

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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-amber-600 hover:text-amber-500 transition-colors duration-200">
                Sign up here
              </a>
            </p>
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