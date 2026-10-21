"use client";

import { Star } from "lucide-react";

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
  listingCount: number;
}

export interface TrendingBuyer {
  id: number;
  name: string;
  businessType: string | null;
  location: string | null;
  orderCount: number;
  totalSpent: number;
  /** Average rating from farmers. 0 means nobody has rated them yet. */
  rating: number;
  ratingCount: number;
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

export interface HomeProduct {
  id: number;
  name: string;
  grade: string | null;
  category: string | null;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  description: string | null;
  originRegion: string | null;
  imageUrl: string | null;
  farmerName: string | null;
}

export interface HomeStats {
  totals: HomeTotals;
  trendingFarmers: TrendingFarmer[];
  trendingBuyers: TrendingBuyer[];
  latestProducts: HomeProduct[];
  reviews: HomeReview[];
}

/* ------------------------------------------------------------------ */
/*  Section shell                                                       */
/* ------------------------------------------------------------------ */

/**
 * Section wrapper.
 *
 * Headings are left-aligned in a narrow column with the supporting copy
 * beside them, rather than every section being a centred stack. That rhythm
 * is what stops a long landing page reading as one grey block.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  action,
  children,
  tinted = false,
  dark,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  tinted?: boolean;
  dark: boolean;
}) {
  return (
    <section
      id={id}
      className={`relative border-t ${
        tinted
          ? dark
            ? "border-white/5 bg-white/[0.02]"
            : "border-black/5 bg-amber-50/40"
          : dark
            ? "border-white/5"
            : "border-black/5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-12 lg:mb-16">
          <div className="max-w-xl">
            <div
              className={`text-xs font-semibold uppercase tracking-[0.18em] mb-3 ${
                dark ? "text-amber-400" : "text-amber-700"
              }`}
            >
              {eyebrow}
            </div>
            <h2
              className={`text-3xl lg:text-[2.5rem] font-bold tracking-tight leading-[1.1] ${
                dark ? "text-white" : "text-stone-900"
              }`}
            >
              {title}
            </h2>
            {description && (
              <p className={`mt-4 text-base lg:text-lg leading-relaxed ${dark ? "text-stone-400" : "text-stone-600"}`}>
                {description}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>

        {children}
      </div>
    </section>
  );
}

/** Text link with an arrow that nudges on hover. Used as the section action. */
export function SectionLink({
  href,
  children,
  dark,
}: {
  href: string;
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
        dark ? "text-amber-400 hover:text-amber-300" : "text-amber-700 hover:text-amber-800"
      }`}
    >
      {children}
      <svg
        viewBox="0 0 16 16"
        className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

/** Five-star row. The numeric value is always rendered alongside, so the
 *  rating never depends on colour perception alone. */
export function StarRating({ rating, className = "" }: { rating: number; className?: string }) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= rounded ? "fill-amber-500 text-amber-500" : "text-stone-300 dark:text-stone-600"
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{rating.toFixed(1)} out of 5</span>
    </span>
  );
}

/** Avatar with a coloured-initial fallback. */
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
  const box = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL, no loader configured
      <img
        src={imageUrl}
        alt=""
        className={`${box} rounded-full object-cover ring-1 ring-black/5 dark:ring-white/10 shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${box} rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0 ring-1 ring-black/5 dark:ring-white/10`}
      aria-hidden="true"
      title={name}
    >
      <span className="font-bold text-white">{initial}</span>
    </div>
  );
}

/** Pill used for grades, categories and certifications. */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "amber" | "emerald" | "sky";
}) {
  const tones: Record<string, string> = {
    neutral:
      "bg-stone-100 text-stone-700 dark:bg-white/5 dark:text-stone-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    sky: "bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

export function CardSkeleton({ dark, rows = 3 }: { dark: boolean; rows?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-64 rounded-2xl animate-pulse ${dark ? "bg-white/5" : "bg-stone-200/70"}`}
        />
      ))}
    </div>
  );
}
