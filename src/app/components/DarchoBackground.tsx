"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  TrendingUp, 
  ChevronRight,
  ArrowRight,
  Sparkles,
  Star
} from "lucide-react";
import LoginForm from "../login/page";
import RegisterForm from "../register/page";
import ForgotPasswordForm from "../forgot/page";
import { TrendingFarmersSection, TrendingBuyersSection, ReviewsSection } from "./home/TrendingSections";
import { DeveloperSection } from "./home/DeveloperSection";
import { SectionSkeleton, type HomeStats } from "./home/shared";

// Floating coffee beans component - Fixed with client-side randomness
const CoffeeBean = ({ delay, index }: { delay: number; index: number }) => {
  const [position, setPosition] = useState({ 
    x1: 0, 
    x2: 0, 
    duration: 20,
    rotation: 0,
    opacitySequence: [0, 1, 1, 0] as [number, number, number, number]
  });
  
  useEffect(() => {
    // Only generate random values on the client
    setPosition({
      x1: Math.random() * 100 - 50,
      x2: Math.random() * 200 - 100,
      duration: 20 + Math.random() * 10,
      rotation: Math.random() * 360,
      opacitySequence: [0, 1, 1, 0]
    });
  }, []);

  return (
    <motion.div
      className="absolute"
      initial={{ 
        y: -100, 
        x: position.x1, 
        rotate: 0, 
        opacity: 0 
      }}
      animate={{ 
        y: "100vh", 
        x: position.x2,
        rotate: 360,
        opacity: position.opacitySequence
      }}
      transition={{
        duration: position.duration,
        repeat: Infinity,
        delay: delay,
        ease: "linear"
      }}
    >
      <Coffee className="w-6 h-6 text-amber-600/30" />
    </motion.div>
  );
};

// Main component
export default function DarchoBackground() {
  const [activeModal, setActiveModal] = useState<"login" | "register" | "forgot" | null>(null);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("hero");
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Real homepage statistics. Sections with no data render an honest empty
  // state, never a fabricated number.
  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const res = await fetch("/api/home/stats");
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.success) setStats(json.data);
      } catch (err) {
        console.error("Failed to load homepage stats:", err);
      } finally {
        if (!cancelled) setStatsLoading(false);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    const sections = ["hero", "farmers", "buyers", "reviews", "developer"];
    const handleScroll = () => {
      let current = "hero";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) current = id;
      });
      setActive(current);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeClass = dark 
    ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-gray-900";

  // Don't render animations until mounted
  if (!mounted) {
    return (
      <div className={`w-full min-h-screen ${themeClass}`}>
        {/* Simple static background while loading */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="h-96" /> {/* Placeholder */}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen transition-all duration-700 ${themeClass} overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
        
        {/* Coffee Beans Floating - Only render after mount */}
        {Array.from({ length: 15 }).map((_, i) => (
          <CoffeeBean key={i} index={i} delay={i * 1.5} />
        ))}
      </div>

      {/* ================= MODERN NAVIGATION ================= */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className={`fixed top-0 left-0 w-full z-50 ${
          dark 
            ? "bg-gray-900/80 backdrop-blur-xl border-gray-800" 
            : "bg-white/80 backdrop-blur-xl border-amber-100"
        } border-b transition-all duration-500`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo with Icon */}
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 15 }}
                className={`p-2 rounded-xl ${
                  dark ? "bg-amber-900/20" : "bg-amber-100"
                }`}
              >
                <Coffee className="w-6 h-6 text-amber-600" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  DARCHO
                </h1>
                <p className="text-xs opacity-60">Ethiopian Coffee Marketplace</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {[
                ["farmers", "Farmers"],
                ["buyers", "Buyers"],
                ["reviews", "Reviews"],
                ["developer", "Developer"],
              ].map(([id, label]) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="relative group"
                >
                  <span className={`font-medium transition-colors ${
                    active === id 
                      ? "text-amber-600" 
                      : dark ? "text-gray-300" : "text-gray-600"
                  }`}>
                    {label}
                  </span>
                  <span className={`absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 ${
                    active === id ? "w-full" : ""
                  } bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300`} />
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDark(!dark)}
                className={`p-2 rounded-full ${
                  dark 
                    ? "bg-gray-800 text-amber-400 hover:bg-gray-700" 
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                } transition-colors`}
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </motion.button>

              {/* Auth Buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("login")}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
              >
                Sign In
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("register")}
                className="px-5 py-2.5 rounded-lg border-2 border-amber-600 text-amber-600 font-semibold hover:bg-amber-50 transition-colors hidden sm:block"
              >
                Get Started
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100/20 transition-colors"
              >
                {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden overflow-hidden ${
                dark ? "bg-gray-900/95" : "bg-white/95"
              } backdrop-blur-xl border-t`}
            >
              <div className="px-6 py-4 space-y-4">
                {[
                  ["farmers", "Farmers"],
                  ["buyers", "Buyers"],
                  ["reviews", "Reviews"],
                  ["developer", "Developer"],
                ].map(([id, label]) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 px-4 rounded-lg transition-colors ${
                      active === id
                        ? dark 
                          ? "bg-amber-900/30 text-amber-400" 
                          : "bg-amber-100 text-amber-700"
                        : dark 
                          ? "hover:bg-gray-800" 
                          : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ================= HERO SECTION ================= */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold">Transforming Coffee Trade</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6">
                <span className="block">Empowering</span>
                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  Ethiopian Farmers
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                A revolutionary digital marketplace connecting coffee farmers directly with global buyers. 
                Fair prices, transparent deals, and modern tools for sustainable growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("register")}
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-lg flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
                >
                  Start Trading Free
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("login")}
                  className="px-8 py-4 rounded-xl border-2 border-amber-600 text-amber-600 dark:text-amber-400 font-semibold text-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                >
                  Sign In to Dashboard
                </motion.button>
              </div>

              {/* Stats — real counts only. A stat is omitted rather than shown
                  as a fabricated number when the database has nothing yet. */}
              {(() => {
                const total = stats?.totals;
                const items = [
                  { value: total?.farmers ?? 0, label: "Coffee Farmers" },
                  { value: total?.products ?? 0, label: "Active Listings" },
                  { value: total?.orders ?? 0, label: "Orders Traded" },
                ].filter((item) => item.value > 0);

                if (statsLoading) {
                  return (
                    <div className="grid grid-cols-3 gap-6 mt-12" aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="text-center">
                          <div className="h-8 w-20 mx-auto rounded bg-gray-200/60 dark:bg-gray-700/60 animate-pulse" />
                          <div className="h-3 w-24 mx-auto mt-2 rounded bg-gray-200/50 dark:bg-gray-700/50 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  );
                }

                if (items.length === 0) return null;

                return (
                  <div className={`grid gap-6 mt-12 ${items.length === 1 ? "grid-cols-1 max-w-xs" : items.length === 2 ? "grid-cols-2 max-w-md" : "grid-cols-3"}`}>
                    {items.map((item) => (
                      <div key={item.label} className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          {item.value.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.label}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                {/* Replace with actual image */}
                <div className="aspect-[4/3] bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Floating cards — real figures only, omitted when unavailable. */}
                {!statsLoading && (stats?.totals.products ?? 0) > 0 && (
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute top-1/4 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{stats!.totals.products.toLocaleString()}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Live Listings</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!statsLoading && (stats?.reviews ?? []).length > 0 && (
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-1/4 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Star className="w-5 h-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{stats!.totals.averageRating.toFixed(1)}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Rating</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= TRENDING FARMERS ================= */}
      {statsLoading ? (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <SectionSkeleton dark={dark} />
          </div>
        </section>
      ) : (
        <TrendingFarmersSection farmers={stats?.trendingFarmers ?? []} dark={dark} />
      )}

      {/* ================= TRENDING BUYERS ================= */}
      {!statsLoading && (
        <TrendingBuyersSection buyers={stats?.trendingBuyers ?? []} dark={dark} />
      )}

      {/* ================= RATINGS & REVIEWS ================= */}
      {!statsLoading && (
        <ReviewsSection
          reviews={stats?.reviews ?? []}
          averageRating={stats?.totals.averageRating ?? 0}
          dark={dark}
        />
      )}

      {/* ================= ABOUT THE DEVELOPER ================= */}
      <DeveloperSection dark={dark} />

      {/* ================= CTA SECTION ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-orange-600/10" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Coffee Business?
            </h2>
            <p className="text-xl text-amber-100 mb-8">
              Join the marketplace connecting Ethiopian coffee farmers with buyers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("register")}
                className="px-8 py-4 rounded-xl bg-white text-amber-700 font-semibold text-lg hover:shadow-xl transition-all"
              >
                Create Free Account
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("login")}
                className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 border-t dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <Coffee className="w-8 h-8 text-amber-600" />
              <div>
                <h2 className="text-2xl font-bold">DARCHO</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ethiopian Coffee Marketplace
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-6 justify-center">
              <a href="#farmers" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Farmers
              </a>
              <a href="#buyers" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Buyers
              </a>
              <a href="#reviews" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Reviews
              </a>
              <a href="#developer" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Developer
              </a>
              <a
                href="mailto:abrihamkassa323@gmail.com"
                className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          
          <div className="text-center mt-8 pt-8 border-t dark:border-gray-800">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} Darcho. Empowering Ethiopian coffee farmers worldwide.
            </p>
          </div>
        </div>
      </footer>

      {/* ================= AUTH MODALS ================= */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            key="auth-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
            />
            
            {/* Modal */}
            <motion.div
              className={`relative w-full z-10 max-h-[90vh] overflow-y-auto ${
                activeModal === "register" ? "max-w-4xl" : "max-w-md"
              }`}
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl ${
                dark ? "bg-gray-900" : "bg-white"
              }`}>
                <div className="p-6 sm:p-8">
                  <button
                    onClick={() => setActiveModal(null)}
                    className={`absolute top-6 right-6 p-2 rounded-full ${
                      dark 
                        ? "hover:bg-gray-800 text-gray-400" 
                        : "hover:bg-gray-100 text-gray-600"
                    } transition-colors`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`p-2 rounded-xl ${
                      dark ? "bg-amber-900/30" : "bg-amber-100"
                    }`}>
                      <Coffee className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {activeModal === "login" && "Welcome Back"}
                        {activeModal === "register" && "Join Darcho"}
                        {activeModal === "forgot" && "Reset Password"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activeModal === "login" && "Sign in to your account"}
                        {activeModal === "register" && "Create your free account"}
                        {activeModal === "forgot" && "Recover your account"}
                      </p>
                    </div>
                  </div>
                  
                  {activeModal === "login" && <LoginForm />}
                  {activeModal === "register" && <RegisterForm />}
                  {activeModal === "forgot" && <ForgotPasswordForm />}
                </div>
                
                {/* Modal Footer */}
                <div className={`p-6 border-t ${
                  dark ? "border-gray-800" : "border-gray-200"
                }`}>
                  <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {activeModal === "login" && (
                      <>
                        Don't have an account?{" "}
                        <button
                          onClick={() => setActiveModal("register")}
                          className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                          Sign up
                        </button>
                      </>
                    )}
                    {activeModal === "register" && (
                      <>
                        Already have an account?{" "}
                        <button
                          onClick={() => setActiveModal("login")}
                          className="text-amber-600 hover:text-amber-700 font-semibold"
                        >
                          Sign in
                        </button>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}