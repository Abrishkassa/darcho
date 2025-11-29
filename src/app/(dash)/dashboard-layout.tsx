"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { title: "Overview", href: "/" },
  { title: "Products", href: "/products" },
  { title: "Orders", href: "/orders" },
  { title: "Analytics", href: "/analytics" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex bg-amber-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-amber-200 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-amber-800 mb-6">Darcho</h1>

        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "block px-4 py-2 rounded-lg text-amber-900 hover:bg-amber-100 hover:text-amber-800 transition"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
