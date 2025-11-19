"use client";

import { motion } from "framer-motion";
import { useState } from "react";

export default function DarchoHome() {
  const [isDark, setIsDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const leaves = Array.from({ length: 18 });
  const particles = Array.from({ length: 25 });

  return (
    <div className={`
      w-full min-h-screen transition
      ${isDark ? "bg-stone-900" : "bg-[#f5efe6]"}
    `}>

      {/* ================= NAVIGATION BAR ================= */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl shadow-sm 
        ${isDark ? "bg-stone-900/70" : "bg-[#f5efe6]/70"}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          {/* LEFT: LOGO */}
          <h1 className={`text-2xl font-bold tracking-wide 
            ${isDark ? "text-white" : "text-amber-900"}`}>
            DARCHO
          </h1>

          {/* CENTER: NAV LINKS (hidden on mobile) */}
          <div className="hidden md:flex gap-8 font-medium">
            {["About", "How It Works", "Features", "Pricing", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "")}`}
                className={`hover:opacity-70 transition 
                  ${isDark ? "text-white" : "text-amber-900"}`}
              >
                {item}
              </a>
            ))}
          </div>

          {/* RIGHT SIDE: DARK/LIGHT BUTTON + LOGIN BUTTON + MOBILE ICON */}
          <div className="flex items-center gap-4">

            {/* DARK/LIGHT MODE TOGGLE */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:scale-110 transition"
            >
              {/* Light Icon */}
              {!isDark && (
                <svg width="24" height="24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}

              {/* Dark Icon */}
              {isDark && (
                <svg width="24" height="24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            {/* LOGIN BUTTON */}
            <button
              className={`px-4 py-2 text-sm rounded-lg transition font-semibold 
              ${isDark 
                ? "bg-white text-black hover:bg-gray-300" 
                : "bg-amber-900 text-amber-50 hover:bg-amber-700"
              }`}
            >
              Login
            </button>

            {/* MOBILE MENU ICON */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2"
            >
              {!menuOpen ? (
                // Hamburger icon
                <svg width="28" height="28" stroke={isDark ? "white" : "black"} strokeWidth="2">
                  <line x1="4" y1="7" x2="24" y2="7" />
                  <line x1="4" y1="14" x2="24" y2="14" />
                  <line x1="4" y1="21" x2="24" y2="21" />
                </svg>
              ) : (
                // X icon
                <svg width="28" height="28" stroke={isDark ? "white" : "black"} strokeWidth="2">
                  <line x1="6" y1="6" x2="22" y2="22" />
                  <line x1="22" y1="6" x2="6" y2="22" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* MOBILE DROPDOWN MENU */}
        {menuOpen && (
          <div className={`md:hidden flex flex-col gap-4 px-6 py-4 pb-6
            ${isDark ? "bg-stone-900 text-white" : "bg-[#f5efe6] text-amber-900"}`}>
            {["About", "How It Works", "Features", "Pricing", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/ /g, "")}`}
                onClick={() => setMenuOpen(false)}
                className="py-2 border-b border-amber-200/30"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </motion.nav>

      {/* ================= HERO + BACKGROUND ================= */}
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">

        {/* Sunlight effect */}
        <div className="absolute inset-0 pointer-events-none">
          {!isDark && (
            <>
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-yellow-200/20 to-transparent rotate-12"></div>
              <div className="absolute top-0 left-1/3 w-1/2 h-full bg-gradient-to-br from-yellow-100/10 to-transparent rotate-6"></div>
            </>
          )}
        </div>

        {/* FLOATING PARTICLES */}
        {particles.map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className={`absolute w-1 h-1 rounded-full 
              ${isDark ? "bg-white/20" : "bg-amber-900/30"}`}
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
            className="absolute w-10 h-10"
            initial={{ y: -150, x: Math.random() * 900 - 450, opacity: 0 }}
            animate={{ y: "120vh", x: Math.random() * 900 - 450, opacity: [0, 1, 1, 0], rotate: [0, 12, -12, 0] }}
            transition={{ duration: 16 + Math.random() * 6, repeat: Infinity, delay: Math.random() * 4 }}
            aria-hidden
          >
            <path
              d="M32 2C20 12 10 26 12 40c2 18 18 22 20 22s18-4 20-22C54 26 44 12 32 2z"
              fill={isDark ? "#4a7a42" : "#3f6f3f"}
            />
          </motion.svg>
        ))}

        {/* HERO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
        >
          <h1 className={`text-5xl md:text-7xl font-extrabold tracking-wide drop-shadow-xl leading-tight
            ${isDark ? "text-white" : "text-amber-900"}`}>
            DARCHO
          </h1>
          <p className={`mt-4 text-lg md:text-xl font-medium leading-relaxed
            ${isDark ? "text-white/80" : "text-amber-900/90"}`}>
            Empowering Ethiopian coffee farmers with fair, transparent, and modern digital trading.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`mt-6 px-8 py-3 rounded-xl font-semibold shadow-lg transition
            ${isDark ? "bg-white text-black hover:bg-gray-300" : "bg-amber-800 text-amber-50 hover:bg-amber-900"}`}
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* ================= SECTIONS ================= */}

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-amber-900"}`}>
          About Darcho
        </h2>
        <p className={`${isDark ? "text-white/80" : "text-amber-900/90"} text-lg`}>
          Darcho bridges the gap between coffee farmers and buyers by creating a transparent, fair, and modern digital marketplace.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className={`py-24 px-6 max-w-5xl mx-auto text-center 
        ${isDark ? "bg-stone-800" : "bg-amber-50"}`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-amber-900"}`}>
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-10 mt-8">
          {[
            ["1. Farmers Upload", "Farmers list their coffee with verified details and fair price."],
            ["2. Buyers Discover", "Buyers browse authentic listings with trusted verification."],
            ["3. Transparent Deal", "Both sides negotiate and complete deals with full transparency."]
          ].map(([title, desc], i) => (
            <div key={i} className={`p-6 shadow-md rounded-xl 
              ${isDark ? "bg-stone-900 text-white/90" : "bg-white text-amber-900"}`}>
              <h3 className="text-2xl font-semibold mb-2">{title}</h3>
              <p className={`${isDark ? "text-white/70" : "text-amber-900/80"}`}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className={`text-4xl font-bold mb-10 ${isDark ? "text-white" : "text-amber-900"}`}>
          Features
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            "Fair Pricing", "Fraud Protection", "Digital Traceability",
            "Marketplace Insights", "Messaging System", "Quality Profiles"
          ].map((feature, i) => (
            <div key={i} className={`
              p-6 shadow-xl rounded-xl border 
              ${isDark ? "bg-stone-900 border-stone-700 text-white" 
                       : "bg-white border-amber-200 text-amber-900"}`}>
              {feature}
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className={`py-24 px-6 max-w-4xl mx-auto text-center 
        ${isDark ? "bg-stone-800" : "bg-amber-50"}`}>
        <h2 className={`text-4xl font-bold mb-6 ${isDark ? "text-white" : "text-amber-900"}`}>
          Pricing
        </h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {[
            ["Free", "Basic listing & browsing. Ideal for small farmers starting out.", "0 ETB / month"],
            ["Pro", "Verified listings, priority placement, and transaction protection.", "Monthly - 299 ETB"],
            ["Enterprise", "Bulk tools and advanced reports for unions and exporters.", "Contact us"]
          ].map(([title, desc, price], i) => (
            <div key={i} className={`
              p-6 rounded-xl shadow-lg border
              ${isDark ? "bg-stone-900 border-stone-700 text-white" 
                       : "bg-white border-amber-200 text-amber-900"}`}>
              <h3 className="text-2xl font-semibold mb-2">{title}</h3>
              <p className={`${isDark ? "text-white/70" : "text-amber-900/80"}`}>{desc}</p>
              <div className="mt-4 font-bold">{price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className={`text-4xl font-bold mb-4 ${isDark ? "text-white" : "text-amber-900"}`}>
          Contact
        </h2>
        <p className={`${isDark ? "text-white/70" : "text-amber-900/80"} mb-6`}>
          Have questions or want to partner with DARCHO? Send us a message.
        </p>

        <form className="max-w-xl mx-auto grid gap-4">
          <input className={`p-3 rounded-lg border 
            ${isDark ? "bg-stone-800 border-stone-600 text-white" 
                     : "border-amber-200"}`} placeholder="Full name" />

          <input className={`p-3 rounded-lg border 
            ${isDark ? "bg-stone-800 border-stone-600 text-white" 
                     : "border-amber-200"}`} placeholder="Email" />

          <textarea
            className={`p-3 rounded-lg border 
              ${isDark ? "bg-stone-800 border-stone-600 text-white" 
                       : "border-amber-200"}`}
            rows={4}
            placeholder="Message"
          />

          <button type="submit" className={`
            mt-2 px-6 py-3 rounded-xl font-semibold transition
            ${isDark ? "bg-white text-black hover:bg-gray-300"
                     : "bg-amber-800 text-amber-50 hover:bg-amber-900"}`}>
            Send Message
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className={`py-10 text-center border-t 
        ${isDark ? "border-stone-700 text-white/70" 
                 : "border-amber-100 text-amber-800/80"}`}>
        © {new Date().getFullYear()} DARCHO — Built for Ethiopian Coffee Farmers
      </footer>

    </div>
  );
}
