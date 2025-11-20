// app/components/AuthCard.tsx
"use client";

import { motion } from "framer-motion";
import React from "react";

export default function AuthCard({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white/95 dark:bg-stone-900/95 rounded-2xl shadow-2xl p-8 md:p-10"
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-900 dark:text-amber-200">
          {title ?? "Welcome"}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm text-amber-700/80 dark:text-amber-100/80">
            {subtitle}
          </p>
        )}
      </div>

      <div>{children}</div>

      <div className="mt-6 text-center text-xs text-amber-700/70 dark:text-amber-100/60">
        <p>By continuing you agree to DARCHO’s terms & privacy.</p>
      </div>
    </motion.div>
  );
}
