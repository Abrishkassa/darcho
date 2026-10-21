"use client";

import { Star, Leaf } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Shared types — mirror the /api/home/stats response                 */
/* ------------------------------------------------------------------ */

export interface HomeTotals {
  farmers: number;
  buyers: number;
  products: number;
  orders: number;
  reviews: number;
  averageRating: number;
}

export interface TrendingFarmer {
  id: number;
  name: string;
  region: string | null;
  rating: number;
  yearsFarming: number | null;
  certifications: string[];
  imageUrl: string | null;
  initial: string;
}

export interface TrendingBuyer {
  id: number;
  name: string;
  businessType: string | null;
  location: string | null;
  orderCount: number;
  totalSpent: number;
  initial: string;
}

export interface HomeReview {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string | null;
  reviewerName: string;
  reviewedName: string | null;
  productName: string | null;
  reviewerInitial: string;
}

export interface HomeStats {
  totals: HomeTotals;
  trendingFarmers: TrendingFarmer[];
  trendingBuyers: TrendingBuyer[];
  reviews: HomeReview[];
}

/* ------------------------------------------------------------------ */
/*  Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

/** Five-star row. Filled stars carry the rating; the number is always shown
 *  alongside so the meaning is never carried by colour alone. */
export function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rounded ? "fill-amber-500 text-amber-500" : "text-gray-300 dark:text-gray-600"
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{rating.toFixed(1)} out of 5</span>
    </span>
  );
}

/** Avatar that falls back to a coloured initial when there is no image. */
export function Avatar({
  initial,
  imageUrl,
  name,
  size = "md",
}: {
  initial: string;
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const box = size === "sm" ? "w-10 h-10 text-sm" : "w-12 h-12 text-base";
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL, no loader configured
      <img
        src={imageUrl}
        alt=""
        className={`${box} rounded-full object-cover border border-black/10 dark:border-white/10 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${box} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0`}
      aria-hidden="true"
      title={name}
    >
      <span className="font-bold text-white">{initial}</span>
    </div>
  );
}

/** Section heading with an optional eyebrow chip. Keeps the outline coherent:
 *  every section gets exactly one <h2>. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  dark,
}: {
  eyebrow: string;
  title: string;
  description: string;
  dark: boolean;
}) {
  return (
    <div className="text-center mb-14">
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
          dark
            ? "bg-amber-900/30 text-amber-400"
            : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700"
        }`}
      >
        <span className="text-sm font-semibold">{eyebrow}</span>
      </div>
      <h2 className={`text-4xl lg:text-5xl font-bold mb-4 ${dark ? "text-white" : "text-gray-900"}`}>
        {title}
      </h2>
      <p
        className={`text-xl max-w-2xl mx-auto ${
          dark ? "text-gray-300" : "text-gray-600"
        }`}
      >
        {description}
      </p>
    </div>
  );
}

/** Honest empty state used when a section has no real data yet. Never shows a
 *  fabricated number or placeholder persona. */
export function EmptyState({
  icon: Icon,
  title,
  message,
  dark,
}: {
  icon: typeof Leaf;
  title: string;
  message: string;
  dark: boolean;
}) {
  return (
    <div
      className={`max-w-md mx-auto text-center p-10 rounded-2xl border ${
        dark ? "border-gray-700 bg-gray-800/40" : "border-gray-200 bg-white/60"
      }`}
    >
      <div
        className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
          dark ? "bg-amber-900/30" : "bg-amber-100"
        }`}
      >
        <Icon className="w-7 h-7 text-amber-600" aria-hidden="true" />
      </div>
      <h3 className={`text-lg font-semibold mb-1 ${dark ? "text-white" : "text-gray-900"}`}>
        {title}
      </h3>
      <p className={`text-sm ${dark ? "text-gray-400" : "text-gray-600"}`}>{message}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

export function SectionSkeleton({ dark, rows = 3 }: { dark: boolean; rows?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-40 rounded-2xl animate-pulse ${
            dark ? "bg-gray-800/60" : "bg-gray-200/60"
          }`}
        />
      ))}
    </div>
  );
}
