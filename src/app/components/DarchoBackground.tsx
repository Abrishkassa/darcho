"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "../login/page";
import RegisterForm from "../register/page";
import ForgotPasswordForm from "../forgot/page";

export default function DarchoBackground() {
  const leaves = Array.from({ length: 18 });
  const particles = Array.from({ length: 25 });

  // State for modals
  const [activeModal, setActiveModal] = useState<"login" | "register" | "forgot" | null>(null);
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("hero");

  // Smooth scroll tracking for nav highlighting
  useEffect(() => {
    const sections = ["hero", "about", "how", "features", "pricing", "contact"];
    const handleScroll = () => {
      let current = "hero";
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 150) current = id;
      });
      setActive(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const themeClass = dark ? "bg-[#1a1a1a] text-gray-100" : "bg-[#f5efe6] text-amber-900";

  const modalVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-500 ${themeClass}`}>
      {/* ================= NAVIGATION ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className={`fixed top-0 left-0 w-full z-50 border-b ${
          dark ? "border-white/10 bg-black/20" : "border-amber-900/10 bg-white/30"
        } backdrop-blur-xl shadow-lg`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          {/* LOGO */}
          <h1 className="text-2xl font-bold tracking-wide">DARCHO</h1>

          {/* CENTER NAV LINKS (DESKTOP) */}
          <div className="hidden md:flex gap-10 font-medium">
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
                className={`transition ${active === id ? "text-amber-700 font-semibold" : "opacity-80 hover:opacity-100"}`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* RIGHT SIDE ICONS */}
          <div className="flex items-center gap-4">
            {/* Dark / Light toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-full hover:scale-110 transition border border-white/20"
            >
              {dark ? "🌞" : "🌙"}
            </button>

            {/* LOGIN / REGISTER */}
            <button
              onClick={() => setActiveModal("login")}
              className="px-4 py-2 rounded-lg bg-amber-800 text-white font-semibold hover:bg-amber-900 transition"
            >
              Login
            </button>
            <button
              onClick={() => setActiveModal("register")}
              className="px-4 py-2 rounded-lg bg-amber-700 text-white font-semibold hover:bg-amber-800 transition"
            >
              Register
            </button>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-3xl"
            >
              {menuOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden flex flex-col px-6 pb-4 text-lg ${
              dark ? "bg-black/40" : "bg-white/40"
            } backdrop-blur-xl`}
          >
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
                className="py-3 border-b border-white/10"
              >
                {label}
              </a>
            ))}
          </motion.div>
        )}
      </motion.nav>

      {/* ================= HERO SECTION ================= */}
      <div id="hero" className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        {/* SUNLIGHT */}
        {!dark ? (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-yellow-200/20 to-transparent rotate-12"></div>
            <div className="absolute top-0 left-1/3 w-1/2 h-full bg-gradient-to-br from-yellow-100/10 to-transparent rotate-6"></div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        )}

        {/* PARTICLES */}
        {particles.map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className={`absolute w-1 h-1 rounded-full ${dark ? "bg-gray-300/40" : "bg-amber-900/30"}`}
            initial={{ x: Math.random() * 800 - 400, y: Math.random() * 600 - 300, opacity: 0 }}
            animate={{ y: [null, Math.random() * -200 - 200], opacity: [0, 0.6, 0] }}
            transition={{ duration: 6 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 4 }}
          />
        ))}

        {/* FLOATING LEAVES */}
        {leaves.map((_, i) => (
          <motion.svg
            key={`l-${i}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className="absolute w-10 h-10 opacity-90"
            initial={{ y: -150, x: Math.random() * 900 - 450, opacity: 0 }}
            animate={{
              y: "120vh",
              x: Math.random() * 900 - 450,
              opacity: [0, 1, 1, 0],
              rotate: [0, 14, -14, 0],
            }}
            transition={{
              duration: 16 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          >
            <path d="M32 2C20 12 10 26 12 40c2 18 18 22 20 22s18-4 20-22C54 26 44 12 32 2z" fill="#3f6f3f" />
          </motion.svg>
        ))}

        {/* HERO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-xl leading-tight">
            DARCHO
          </h1>
          <p className="mt-4 text-lg md:text-xl text-amber-900/90 font-medium leading-relaxed">
            Empowering Ethiopian coffee farmers with fair, transparent, and modern digital trading.
          </p>
        </motion.div>
      </div>

      {/* ================= SECTIONS ================= */}
      <section id="about" className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-4">About Darcho</h2>
        <p className="text-lg text-amber-900/90 max-w-3xl mx-auto">
          Darcho bridges the gap between coffee farmers and buyers by creating a transparent, fair, and modern digital marketplace.
        </p>
      </section>

      <section id="how" className={`py-24 px-6 max-w-5xl mx-auto text-center ${dark ? "bg-black/20" : "bg-amber-50"}`}>
        <h2 className="text-4xl font-bold text-amber-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10 mt-8">
          <div className="p-6 shadow-md rounded-xl bg-white/80">
            <h3 className="text-2xl font-semibold mb-2">1. Farmers Upload</h3>
            <p className="opacity-80">Farmers list their coffee with verified details and fair price.</p>
          </div>
          <div className="p-6 shadow-md rounded-xl bg-white/80">
            <h3 className="text-2xl font-semibold mb-2">2. Buyers Discover</h3>
            <p className="opacity-80">Buyers browse authentic listings with trusted verification.</p>
          </div>
          <div className="p-6 shadow-md rounded-xl bg-white/80">
            <h3 className="text-2xl font-semibold mb-2">3. Transparent Deal</h3>
            <p className="opacity-80">Both sides negotiate with full transparency.</p>
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-10">Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            "Fair Pricing",
            "Fraud Protection",
            "Digital Traceability",
            "Marketplace Insights",
            "Messaging System",
            "Quality Profiles",
          ].map((f) => (
            <div key={f} className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">{f}</div>
          ))}
        </div>
      </section>

      <section id="pricing" className={`py-24 px-6 max-w-4xl mx-auto text-center ${dark ? "bg-black/20" : "bg-amber-50"}`}>
        <h2 className="text-4xl font-bold text-amber-900 mb-6">Pricing</h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="opacity-80">Basic listing & browsing. Ideal for beginners.</p>
            <div className="mt-4 font-bold">0 ETB / month</div>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="opacity-80">Verified listings, priority placement.</p>
            <div className="mt-4 font-bold">299 ETB / month</div>
          </div>
          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
            <p className="opacity-80">Bulk tools, reports, and exporter features.</p>
            <div className="mt-4 font-bold">Contact us</div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-4">Contact</h2>
        <p className="text-amber-900/80 mb-6">Send us a message.</p>
        <form className="max-w-xl mx-auto grid gap-4">
          <input className="p-3 rounded-lg border border-amber-200" placeholder="Full name" />
          <input className="p-3 rounded-lg border border-amber-200" placeholder="Email" />
          <textarea className="p-3 rounded-lg border border-amber-200" rows={4} placeholder="Message" />
          <button type="submit" className="mt-2 px-6 py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition">
            Send Message
          </button>
        </form>
      </section>

      <footer className="py-10 text-center text-amber-800/80 border-t border-amber-100">
        © {new Date().getFullYear()} DARCHO — Built for Ethiopian Coffee Farmers
      </footer>

      {/* ================= MODAL FOR AUTH ================= */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            key="auth-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 w-full max-w-md relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-amber-800 font-bold text-xl"
              >
                ×
              </button>

              {activeModal === "login" && <LoginForm />}
              {activeModal === "register" && <RegisterForm />}
              {activeModal === "forgot" && <ForgotPasswordForm />}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
