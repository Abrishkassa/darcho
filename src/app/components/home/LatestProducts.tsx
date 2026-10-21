"use client";

import { motion } from "framer-motion";
import { Coffee, MapPin, User, Sparkles } from "lucide-react";
import {
  Section,
  SectionLink,
  Pill,
  type HomeProduct,
} from "./shared";

/**
 * Latest listings.
 *
 * This is the section that actually earns the visit: real lots pulled straight
 * from the marketplace, newest first. The card mirrors the buyer marketplace's
 * product card so the same lot looks identical on both pages.
 */
export function LatestProductsSection({
  products,
  dark,
  loading,
}: {
  products: HomeProduct[];
  dark: boolean;
  loading: boolean;
}) {
  if (!loading && products.length === 0) return null;

  const surface = `group rounded-2xl border overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
    dark
      ? "border-white/10 bg-white/[0.03] hover:border-white/20 hover:shadow-2xl hover:shadow-black/40"
      : "border-black/5 bg-white shadow-sm hover:shadow-xl hover:shadow-stone-900/5"
  }`;

  return (
    <Section
      id="listings"
      eyebrow="Fresh listings"
      title="Coffee on the market right now"
      description="The newest lots posted by Ethiopian farmers, with the price per unit and the stock still available."
      action={
        <SectionLink href="/buyer" dark={dark}>
          Browse all {products.length > 0 ? "listings" : ""}
        </SectionLink>
      }
      dark={dark}
    >
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-80 rounded-2xl animate-pulse ${dark ? "bg-white/5" : "bg-stone-200/70"}`}
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: index * 0.07, ease: [0.2, 0, 0, 1] }}
              className={surface}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote Supabase URL, no loader configured
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center">
                    <Coffee className="w-14 h-14 text-white/80" aria-hidden="true" />
                  </div>
                )}

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {product.grade && <Pill tone="amber">Grade {product.grade}</Pill>}
                </div>

                {product.category && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-black/55 text-white backdrop-blur-sm">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <h3
                  className={`font-bold text-lg leading-snug mb-1 line-clamp-2 ${
                    dark ? "text-white" : "text-stone-900"
                  }`}
                >
                  {product.name}
                </h3>

                <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-sm ${dark ? "text-stone-400" : "text-stone-600"}`}>
                  {product.originRegion && (
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{product.originRegion}</span>
                    </span>
                  )}
                  {product.farmerName && (
                    <span className="inline-flex items-center gap-1.5 min-w-0">
                      <User className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{product.farmerName}</span>
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className={`mt-3 text-sm leading-relaxed line-clamp-2 ${dark ? "text-stone-400" : "text-stone-600"}`}>
                    {product.description}
                  </p>
                )}

                <div
                  className={`mt-5 pt-4 flex items-end justify-between gap-3 border-t ${
                    dark ? "border-white/10" : "border-black/5"
                  }`}
                >
                  <div>
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-500 tabular-nums">
                      ETB {product.pricePerUnit.toLocaleString()}
                      <span className={`text-sm font-normal ${dark ? "text-stone-500" : "text-stone-500"}`}>
                        /{product.unit}
                      </span>
                    </div>
                    <div className={`text-xs mt-0.5 ${dark ? "text-stone-400" : "text-stone-600"}`}>
                      {product.quantity.toLocaleString()} {product.unit} available
                    </div>
                  </div>
                  <a
                    href="/buyer"
                    className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  >
                    Order
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </Section>
  );
}

/**
 * Fallback band shown when no lots are live yet, so the slot is never an empty
 * grey box. It states the truth and points somewhere useful.
 */
export function NoListingsBand({ dark }: { dark: boolean }) {
  return (
    <Section
      id="listings"
      eyebrow="Fresh listings"
      title="The first lots are on their way"
      description="Farmers are still posting their harvests. Create an account and you will see new coffee here the moment it lands."
      dark={dark}
    >
      <div
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-2xl border p-8 ${
          dark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-white shadow-sm"
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            dark ? "bg-amber-500/10" : "bg-amber-100"
          }`}
        >
          <Sparkles className="w-7 h-7 text-amber-600" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold mb-1 ${dark ? "text-white" : "text-stone-900"}`}>
            Selling coffee?
          </h3>
          <p className={`text-sm ${dark ? "text-stone-400" : "text-stone-600"}`}>
            List your lot in a few minutes and it appears here for every buyer on Darcho.
          </p>
        </div>
        <a
          href="/register"
          className="shrink-0 px-5 py-2.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors"
        >
          Start selling
        </a>
      </div>
    </Section>
  );
}
