"use client";

import { motion } from "framer-motion";
import { MapPin, Award, Sprout, Store, Quote, TrendingUp } from "lucide-react";
import {
  Section,
  SectionLink,
  Avatar,
  StarRating,
  Pill,
  type TrendingBuyer,
  type TrendingFarmer,
  type HomeReview,
} from "./shared";

/* ------------------------------------------------------------------ */
/*  Farmers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Farmer spotlight.
 *
 * Rows, not heavy cards: the useful facts (who, where, how long, how many lots)
 * fit in one scannable line. Rated growers lead with their score; unrated ones
 * show how many lots they have listed, so the row is never empty of meaning.
 */
export function FarmersSection({
  farmers,
  dark,
}: {
  farmers: TrendingFarmer[];
  dark: boolean;
}) {
  if (farmers.length === 0) return null;

  const anyRated = farmers.some((f) => f.rating > 0);

  return (
    <Section
      id="farmers"
      eyebrow="Meet the growers"
      title="Farmers behind the coffee"
      description={
        anyRated
          ? "Rated growers first, with the newest farms below them."
          : "The farms listing on Darcho today. Ratings appear here after their first buyer reviews."
      }
      action={
        <SectionLink href="/register" dark={dark}>
          List your farm
        </SectionLink>
      }
      tinted
      dark={dark}
    >
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
        {farmers.map((farmer, index) => (
          <motion.div
            key={farmer.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.2, 0, 0, 1] }}
            className={`flex items-center gap-4 py-4 border-b ${
              dark ? "border-white/10" : "border-black/5"
            }`}
          >
            <Avatar initial={farmer.initial} imageUrl={farmer.imageUrl} name={farmer.name} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-semibold truncate ${dark ? "text-white" : "text-stone-900"}`}>
                  {farmer.name}
                </h3>
                {farmer.certifications.slice(0, 1).map((cert) => (
                  <Pill key={cert} tone="emerald">
                    <Award className="w-3 h-3" aria-hidden="true" />
                    {cert}
                  </Pill>
                ))}
              </div>

              <div
                className={`mt-1 flex items-center gap-x-3 gap-y-1 flex-wrap text-sm ${
                  dark ? "text-stone-400" : "text-stone-600"
                }`}
              >
                {farmer.region && (
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{farmer.region}</span>
                  </span>
                )}
                {farmer.listingCount > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {farmer.listingCount} {farmer.listingCount === 1 ? "lot" : "lots"}
                  </span>
                )}
                {farmer.yearsFarming != null && farmer.yearsFarming > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {farmer.yearsFarming} yrs
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              {farmer.rating > 0 ? (
                <>
                  <div className={`text-lg font-bold tabular-nums ${dark ? "text-white" : "text-stone-900"}`}>
                    {farmer.rating.toFixed(1)}
                  </div>
                  <StarRating rating={farmer.rating} />
                </>
              ) : (
                <Pill>New</Pill>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Buyers                                                              */
/* ------------------------------------------------------------------ */

/**
 * Buyer leaderboard.
 *
 * A ranked list reads faster than a grid here, and the numbers are the story,
 * so they get the emphasis rather than being buried in a footer row.
 */
export function BuyersSection({
  buyers,
  dark,
}: {
  buyers: TrendingBuyer[];
  dark: boolean;
}) {
  if (buyers.length === 0) return null;

  return (
    <Section
      id="buyers"
      eyebrow="Market activity"
      title="Buyers moving the market"
      description="Ranked by the value of coffee they have purchased through Darcho."
      dark={dark}
    >
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-2">
        {buyers.map((buyer, index) => (
          <motion.div
            key={buyer.id}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25), ease: [0.2, 0, 0, 1] }}
            className={`flex items-center gap-4 py-4 border-b ${
              dark ? "border-white/10" : "border-black/5"
            }`}
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold tabular-nums ${
                index === 0
                  ? "bg-amber-600 text-white"
                  : dark
                    ? "bg-white/10 text-stone-300"
                    : "bg-stone-100 text-stone-600"
              }`}
              aria-label={`Rank ${index + 1}`}
            >
              {index + 1}
            </span>

            <Avatar initial={buyer.initial} name={buyer.name} size="sm" />

            <div className="min-w-0 flex-1">
              <h3 className={`font-semibold truncate ${dark ? "text-white" : "text-stone-900"}`}>
                {buyer.name}
              </h3>
              <div className={`mt-0.5 flex items-center gap-x-3 flex-wrap text-sm ${dark ? "text-stone-400" : "text-stone-600"}`}>
                {buyer.businessType && <span className="capitalize">{buyer.businessType}</span>}
                {buyer.location && (
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{buyer.location}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0 text-right">
              <div className={`font-bold tabular-nums ${dark ? "text-white" : "text-stone-900"}`}>
                {buyer.totalSpent.toLocaleString()}
                <span className={`text-xs font-normal ml-1 ${dark ? "text-stone-400" : "text-stone-500"}`}>
                  ETB
                </span>
              </div>
              <div className={`text-xs tabular-nums ${dark ? "text-stone-400" : "text-stone-500"}`}>
                {buyer.orderCount} {buyer.orderCount === 1 ? "order" : "orders"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                             */
/* ------------------------------------------------------------------ */

/**
 * Reviews. Only rendered when real reviews exist — an "no reviews yet" box on a
 * landing page does nothing for a visitor, so the section simply does not run.
 */
export function ReviewsSection({
  reviews,
  averageRating,
  dark,
}: {
  reviews: HomeReview[];
  averageRating: number;
  dark: boolean;
}) {
  if (reviews.length === 0) return null;

  return (
    <Section
      id="reviews"
      eyebrow="Trusted by buyers"
      title="What people say"
      description="Feedback left after completed orders on Darcho."
      tinted
      dark={dark}
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Summary tile */}
        <div
          className={`rounded-2xl border p-6 flex flex-col justify-center ${
            dark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-white shadow-sm"
          }`}
        >
          <div className={`text-4xl font-bold tabular-nums ${dark ? "text-white" : "text-stone-900"}`}>
            {averageRating.toFixed(1)}
          </div>
          <StarRating rating={averageRating} className="mt-2" />
          <div className={`mt-2 text-sm inline-flex items-center gap-1.5 ${dark ? "text-stone-400" : "text-stone-600"}`}>
            <TrendingUp className="w-4 h-4" aria-hidden="true" />
            Across {reviews.length} recent {reviews.length === 1 ? "review" : "reviews"}
          </div>
        </div>

        {reviews.slice(0, 5).map((review, index) => (
          <motion.figure
            key={review.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3), ease: [0.2, 0, 0, 1] }}
            className={`rounded-2xl border p-6 flex flex-col ${
              dark ? "border-white/10 bg-white/[0.03]" : "border-black/5 bg-white shadow-sm"
            }`}
          >
            <Quote className="w-6 h-6 text-amber-500/40 mb-3" aria-hidden="true" />
            <StarRating rating={review.rating} className="mb-3" />
            <blockquote className={`flex-1 text-sm leading-relaxed ${dark ? "text-stone-300" : "text-stone-700"}`}>
              {review.comment || "Rated without a written comment."}
            </blockquote>
            <figcaption className={`mt-5 pt-4 flex items-center gap-3 border-t ${dark ? "border-white/10" : "border-black/5"}`}>
              <Avatar initial={review.reviewerInitial} name={review.reviewerName} size="sm" />
              <div className="min-w-0">
                <div className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-stone-900"}`}>
                  {review.reviewerName}
                </div>
                <div className={`text-xs truncate ${dark ? "text-stone-400" : "text-stone-500"}`}>
                  {review.productName
                    ? `on ${review.productName}`
                    : review.reviewedName
                      ? `reviewed ${review.reviewedName}`
                      : "Verified order"}
                </div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </Section>
  );
}
