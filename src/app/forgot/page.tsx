"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-2 text-center">Forgot Password</h2>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <button
        type="submit"
        className="mt-2 px-6 py-3 rounded-xl bg-amber-800 text-amber-50 font-semibold hover:bg-amber-900 transition"
      >
        Reset Password
      </button>
    </motion.form>
  );
}
