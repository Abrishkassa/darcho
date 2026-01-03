"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Coffee, 
  Sun, 
  Moon, 
  Menu, 
  X, 
  Leaf, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  Award, 
  BarChart,
  MessageSquare,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Sparkles
} from "lucide-react";
import LoginForm from "../login/page";
import RegisterForm from "../register/page";
import ForgotPasswordForm from "../forgot/page";

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

  // Initialize after mount to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    
    const sections = ["hero", "about", "how", "features", "pricing", "contact"];
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
                ["about", "About"],
                ["how", "How It Works"],
                ["features", "Features"],
                ["pricing", "Pricing"],
                ["contact", "Contact"],
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
                  ["about", "About"],
                  ["how", "How It Works"],
                  ["features", "Features"],
                  ["pricing", "Pricing"],
                  ["contact", "Contact"],
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

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                {[
                  ["2.5K+", "Active Farmers"],
                  ["$4.2M+", "Annual Trade"],
                  ["98%", "Satisfaction"],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      {value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{label}</div>
                  </div>
                ))}
              </div>
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
                
                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-1/4 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">+42%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  className="absolute bottom-1/4 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">500+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">New Buyers</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 mb-4">
              <span className="text-sm font-semibold">Simple Process</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">How Darcho Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Three simple steps from farm to cup
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-200 transform -translate-y-1/2" />
            
            {[
              {
                icon: Leaf,
                title: "Farmers List",
                description: "Farmers upload verified coffee lots with transparent pricing",
                color: "from-green-500 to-emerald-600",
              },
              {
                icon: Globe,
                title: "Buyers Discover",
                description: "Global buyers browse authenticated lots with quality scores",
                color: "from-blue-500 to-cyan-600",
              },
              {
                icon: Shield,
                title: "Secure Trade",
                description: "Safe transactions with escrow and quality assurance",
                color: "from-purple-500 to-pink-600",
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`pt-8 p-8 rounded-2xl bg-white dark:bg-gray-800/50 backdrop-blur-sm border ${
                  dark ? "border-gray-700" : "border-gray-200"
                } shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent mb-2`}>
                      0{index + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="py-24 bg-gradient-to-b from-transparent to-amber-50/50 dark:to-gray-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Why Choose Darcho</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Built with farmers in mind - every feature designed for your success
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Award,
                title: "Quality Verification",
                description: "Third-party quality grading and certification",
                color: "amber",
              },
              {
                icon: TrendingUp,
                title: "Fair Pricing",
                description: "Market-based pricing with no hidden fees",
                color: "green",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                description: "Escrow system ensuring safe transactions",
                color: "blue",
              },
              {
                icon: BarChart,
                title: "Market Insights",
                description: "Real-time pricing and demand analytics",
                color: "purple",
              },
              {
                icon: MessageSquare,
                title: "Direct Messaging",
                description: "Communicate directly with buyers",
                color: "pink",
              },
              {
                icon: Users,
                title: "Community Support",
                description: "Connect with other farmers and experts",
                color: "orange",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(feature.title)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`p-6 rounded-2xl border transition-all duration-500 ${
                  dark 
                    ? "bg-gray-800/50 border-gray-700 hover:border-amber-500" 
                    : "bg-white border-gray-200 hover:border-amber-400"
                } hover:shadow-2xl transform hover:-translate-y-1`}
              >
                <div className={`p-3 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 w-fit mb-4`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>
                <div className={`h-0.5 w-0 transition-all duration-500 ${
                  hoveredCard === feature.title ? "w-full" : ""
                } bg-gradient-to-r from-${feature.color}-500 to-${feature.color}-600`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose the plan that fits your needs. No surprises, just value.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "Free",
                description: "Perfect for new farmers",
                features: ["5 Listings", "Basic Analytics", "Community Access", "Email Support"],
                color: "gray",
                popular: false,
              },
              {
                name: "Professional",
                price: "299",
                period: "/month",
                description: "For growing farms",
                features: ["Unlimited Listings", "Advanced Analytics", "Priority Placement", "Quality Certification", "24/7 Support"],
                color: "amber",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                description: "For cooperatives & exporters",
                features: ["Custom Solutions", "Bulk Tools", "API Access", "Dedicated Account Manager", "Training Sessions"],
                color: "purple",
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative rounded-3xl border-2 p-8 ${
                  plan.popular
                    ? dark 
                      ? "border-amber-500 bg-gradient-to-b from-gray-900 to-gray-800" 
                      : "border-amber-500 bg-gradient-to-b from-white to-amber-50"
                    : dark 
                      ? "border-gray-700 bg-gray-800/50" 
                      : "border-gray-200 bg-white"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">{plan.description}</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveModal("register")}
                  className={`w-full py-4 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:shadow-xl hover:shadow-amber-500/30"
                      : dark
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              Join thousands of farmers already growing with Darcho
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("register")}
                className="px-8 py-4 rounded-xl bg-white text-amber-700 font-semibold text-lg hover:shadow-xl transition-all"
              >
                Start Free Trial
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveModal("login")}
                className="px-8 py-4 rounded-xl border-2 border-white text-white font-semibold text-lg hover:bg-white/10 transition-colors"
              >
                Schedule Demo
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
            
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Terms
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-amber-600 transition-colors">
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
              className="relative w-full max-w-md z-10"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
            >
              <div className={`rounded-3xl overflow-hidden shadow-2xl ${
                dark ? "bg-gray-900" : "bg-white"
              }`}>
                <div className="p-8">
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