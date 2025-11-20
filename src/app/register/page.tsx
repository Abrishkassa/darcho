"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [residence, setResidence] = useState("");
  const [region, setRegion] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ fullName, phone, email, residence, region, password });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold text-amber-900 mb-2 text-center">Register</h2>

      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <input
        type="email"
        placeholder="Email (optional)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
      />

      <input
        type="text"
        placeholder="Residence Area"
        value={residence}
        onChange={(e) => setResidence(e.target.value)}
        className="p-3 rounded-lg border border-amber-200 focus:border-amber-800 focus:ring-2 focus:ring-amber-200 outline-none transition"
        required
      />

      <input
        type="text"
        placeholder="Region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
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
        Register
      </button>
    </motion.form>
  );
}
