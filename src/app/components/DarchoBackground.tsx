"use client";

import { motion } from "framer-motion";

export default function DarchoHome() {
  const leaves = Array.from({ length: 18 });
  const particles = Array.from({ length: 25 });

  return (
    <div className="w-full min-h-screen bg-[#f5efe6]">

      {/* NAVIGATION BAR */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl bg-[#f5efe6]/70 shadow-sm"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-amber-900 tracking-wide">DARCHO</h1>
          <div className="hidden md:flex gap-8 text-amber-900 font-medium">
            <a href="#about" className="hover:text-amber-700">About</a>
            <a href="#how" className="hover:text-amber-700">How It Works</a>
            <a href="#features" className="hover:text-amber-700">Features</a>
            <a href="#pricing" className="hover:text-amber-700">Pricing</a>
            <a href="#contact" className="hover:text-amber-700">Contact</a>
          </div>
        </div>
      </motion.nav>

      {/* HERO BACKGROUND + ANIMATION */}
      <div className="relative w-full h-screen overflow-hidden flex items-center justify-center">

        {/* SUNLIGHT */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-yellow-200/20 to-transparent rotate-12"></div>
          <div className="absolute top-0 left-1/3 w-1/2 h-full bg-gradient-to-br from-yellow-100/10 to-transparent rotate-6"></div>
        </div>

        {/* PARTICLES */}
        {particles.map((_, i) => (
          <motion.div
            key={`p-${i}`}
            className="absolute w-1 h-1 bg-amber-900/30 rounded-full"
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
            {Math.random() > 0.5 ? (
              <path d="M32 2C20 12 10 26 12 40c2 18 18 22 20 22s18-4 20-22C54 26 44 12 32 2z" fill="#3f6f3f" />
            ) : (
              <path d="M32 4C18 18 6 30 14 44c8 14 22 16 28 10s14-16 10-30C48 10 40 4 32 4z" fill="#4a7a42" />
            )}
          </motion.svg>
        ))}

        {/* HERO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5 }}
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold text-amber-900 tracking-wide drop-shadow-xl leading-tight">
            DARCHO
          </h1>
          <p className="mt-4 text-lg md:text-xl text-amber-900/90 font-medium leading-relaxed">
            Empowering Ethiopian coffee farmers with fair, transparent, and modern digital trading.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-8 py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold shadow-lg hover:bg-amber-900 transition"
          >
            Get Started
          </motion.button>
        </motion.div>
      </div>

      {/* ================= SECTIONS ================= */}

      {/* ABOUT */}
      <section id="about" className="py-24 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-4">About Darcho</h2>
        <p className="text-lg text-amber-900/90 max-w-3xl mx-auto">
          Darcho bridges the gap between coffee farmers and buyers by creating a transparent, fair, and modern digital marketplace.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-6 max-w-5xl mx-auto text-center bg-amber-50">
        <h2 className="text-4xl font-bold text-amber-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10 mt-8">
          <div className="p-6 shadow-md rounded-xl bg-white">
            <h3 className="text-2xl font-semibold text-amber-900 mb-2">1. Farmers Upload</h3>
            <p className="text-amber-900/80">Farmers list their coffee with verified details and fair price.</p>
          </div>
          <div className="p-6 shadow-md rounded-xl bg-white">
            <h3 className="text-2xl font-semibold text-amber-900 mb-2">2. Buyers Discover</h3>
            <p className="text-amber-900/80">Buyers browse authentic listings with trusted verification.</p>
          </div>
          <div className="p-6 shadow-md rounded-xl bg-white">
            <h3 className="text-2xl font-semibold text-amber-900 mb-2">3. Transparent Deal</h3>
            <p className="text-amber-900/80">Both sides negotiate and complete deals with full transparency.</p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-10">Features</h2>
        <div className="grid md:grid-cols-3 gap-10">
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Fair Pricing</div>
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Fraud Protection</div>
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Digital Traceability</div>
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Marketplace Insights</div>
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Messaging System</div>
          <div className="p-6 bg-white shadow-xl rounded-xl border border-amber-200">Quality Profiles</div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 max-w-4xl mx-auto text-center bg-amber-50">
        <h2 className="text-4xl font-bold text-amber-900 mb-6">Pricing</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="text-amber-900/80">Basic listing & browsing. Ideal for small farmers starting out.</p>
            <div className="mt-4 font-bold">0 ETB / month</div>
          </div>

          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-amber-900/80">Verified listings, priority placement, and transaction protection.</p>
            <div className="mt-4 font-bold">Monthly - 299 ETB</div>
          </div>

          <div className="p-6 rounded-xl bg-white shadow-lg border border-amber-200">
            <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
            <p className="text-amber-900/80">For unions and exporters — bulk tools and advanced reports.</p>
            <div className="mt-4 font-bold">Contact us</div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-amber-900 mb-4">Contact</h2>
        <p className="text-amber-900/80 mb-6">Have questions or want to partner with DARCHO? Send us a message.</p>

        <form className="max-w-xl mx-auto grid gap-4">
          <input className="p-3 rounded-lg border border-amber-200" placeholder="Full name" />
          <input className="p-3 rounded-lg border border-amber-200" placeholder="Email" />
          <textarea className="p-3 rounded-lg border border-amber-200" rows={4} placeholder="Message" />
          <button type="submit" className="mt-2 px-6 py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition">
            Send Message
          </button>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center text-amber-800/80 border-t border-amber-100">
        <div className="max-w-4xl mx-auto">© {new Date().getFullYear()} DARCHO — Built for Ethiopian Coffee Farmers</div>
      </footer>

    </div>
  );
}
