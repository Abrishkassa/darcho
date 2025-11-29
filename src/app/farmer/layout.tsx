"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X, Leaf } from "lucide-react";

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f5efe6]">

      {/* SIDEBAR */}
      <aside className={cn(
        "bg-white shadow-xl fixed md:static inset-y-0 left-0 w-64 p-6 transition-transform",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <h2 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
          <Leaf size={28} /> Darcho Farmer
        </h2>

        <nav className="mt-8 flex flex-col gap-4 text-amber-900 font-medium">
          <Link href="/farmer/products" className="hover:text-amber-600">Products</Link>
          <Link href="/farmer/orders" className="hover:text-amber-600">Orders</Link>
          <Link href="/farmer/profile" className="hover:text-amber-600">Profile</Link>
          <Link href="/farmer/insights" className="hover:text-amber-600">Insights</Link>
        </nav>
      </aside>

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute top-4 left-4 md:hidden bg-white p-2 rounded-lg shadow"
      >
        {open ? <X /> : <Menu />}
      </button>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 md:ml-0 ml-0 mt-14 md:mt-0">
        {children}
      </main>
    </div>
  );
}
