"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function LoginForm({ onForgot }: { onForgot?: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle login logic here
    console.log({ email, password });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-2 text-center">Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <button
        type="submit"
        className="mt-2 px-6 py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition"
      >
        Login
      </button>

      <div className="text-sm text-amber-700 text-right mt-1 cursor-pointer hover:underline" onClick={onForgot}>
        Forgot Password?
      </div>
    </motion.form>
  );
}
