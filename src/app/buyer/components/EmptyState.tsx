"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { useBuyerTheme } from "../theme-context";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

/** Consistent empty state used across all buyer pages. */
export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const { dark } = useBuyerTheme();

  return (
    <div className={`p-16 rounded-2xl border text-center ${dark ? "border-gray-700 bg-gray-800/60" : "border-gray-200 bg-white"}`}>
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          dark ? "bg-gray-700/60" : "bg-amber-100"
        }`}
      >
        <Icon className={`w-8 h-8 ${dark ? "text-amber-400" : "text-amber-600"}`} />
      </div>
      <h2 className="text-lg font-semibold mb-1">{title}</h2>
      <p className={dark ? "text-gray-400" : "text-gray-600"}>{description}</p>
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-5 px-6 py-2.5 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
