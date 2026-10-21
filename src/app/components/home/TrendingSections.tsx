"use client";

import { motion } from "framer-motion";
import { Star, Award, MapPin, Users, ShoppingBag, Sprout, Quote } from "lucide-react";
import {
  Avatar,
  EmptyState,
  SectionHeading,
  StarRating,
  type TrendingBuyer,
  type TrendingFarmer,
  type HomeReview,
} from "./shared";

/* ------------------------------------------------------------------ */
/*  Trending farmers                                                    */
/* ------------------------------------------------------------------ */

export function TrendingFarmersSection({
  farmers,
  dark,
}: {
  farmers: TrendingFarmer[];
  dark: boolean;
}) {
  const card = `p-6 rounded-2xl border h-full ${
    dark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"
  }`;

  return (
    <section id="farmers" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Top Rated"
          title="Trending Coffee Farmers"
          description="The growers buyers rate highest, ranked by their real ratings from completed orders."
          dark={dark}
        />

        {farmers.length === 0 ? (
          <EmptyState
            icon={Sprout}
            title="No rated farmers yet"
            message="Farmer spotlight appears here once growers receive their first reviews from buyers."
            dark={dark}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {farmers.map((farmer, index) => (
              <motion.div
                key={farmer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={card}
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar initial={farmer.initial} imageUrl={farmer.imageUrl} name={farmer.name} />
                  <div className="min-w-0">
                    <h3 className={`font-bold truncate ${dark ? "text-white" : "text-gray-900"}`}>
                      {farmer.name}
                    </h3>
                    {farmer.region && (
                      <p className={`text-sm flex items-center gap-1 truncate ${dark ? "text-gray-400" : "text-gray-600"}`}>
                        <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        {farmer.region}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <StarRating rating={farmer.rating} />
                  <span className={`text-sm font-semibold ${dark ? "text-amber-400" : "text-amber-700"}`}>
                    {farmer.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {farmer.yearsFarming != null && farmer.yearsFarming > 0 && (
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        dark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {farmer.yearsFarming} yrs farming
                    </span>
                  )}
                  {farmer.certifications.slice(0, 2).map((cert) => (
                    <span
                      key={cert}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${
                        dark ? "bg-emerald-900/30 text-emerald-400" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      <Award className="w-3 h-3" aria-hidden="true" />
                      {cert}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trending buyers                                                     */
/* ------------------------------------------------------------------ */

export function TrendingBuyersSection({
  buyers,
  dark,
}: {
  buyers: TrendingBuyer[];
  dark: boolean;
}) {
  const card = `p-6 rounded-2xl border h-full ${
    dark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"
  }`;

  return (
    <section id="buyers" className="py-24 bg-gradient-to-b from-transparent to-amber-50/50 dark:to-gray-900/50">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Active Buyers"
          title="Buyers Driving the Market"
          description="Importers and roasters ranked by the volume of coffee they have purchased on Darcho."
          dark={dark}
        />

        {buyers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No buyer activity yet"
            message="Buyer rankings appear here once orders start flowing through the marketplace."
            dark={dark}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {buyers.map((buyer, index) => (
              <motion.div
                key={buyer.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={card}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initial={buyer.initial} name={buyer.name} size="sm" />
                    <div className="min-w-0">
                      <h3 className={`font-bold truncate ${dark ? "text-white" : "text-gray-900"}`}>
                        {buyer.name}
                      </h3>
                      {buyer.location && (
                        <p className={`text-sm truncate ${dark ? "text-gray-400" : "text-gray-600"}`}>
                          {buyer.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      dark ? "bg-amber-900/40 text-amber-400" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                {buyer.businessType && (
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-4 ${
                      dark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {buyer.businessType}
                  </span>
                )}

                <div className={`flex items-center justify-between text-sm pt-4 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
                  <span className={`inline-flex items-center gap-1.5 ${dark ? "text-gray-400" : "text-gray-600"}`}>
                    <ShoppingBag className="w-4 h-4" aria-hidden="true" />
                    {buyer.orderCount} {buyer.orderCount === 1 ? "order" : "orders"}
                  </span>
                  <span className={`font-semibold ${dark ? "text-white" : "text-gray-900"}`}>
                    {buyer.totalSpent.toLocaleString()} ETB
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                             */
/* ------------------------------------------------------------------ */

export function ReviewsSection({
  reviews,
  averageRating,
  dark,
}: {
  reviews: HomeReview[];
  averageRating: number;
  dark: boolean;
}) {
  const card = `p-6 rounded-2xl border h-full flex flex-col ${
    dark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"
  }`;

  return (
    <section id="reviews" className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Verified Feedback"
          title="Ratings & Reviews"
          description="Real feedback left by buyers and farmers after completed transactions."
          dark={dark}
        />

        {reviews.length > 0 && averageRating > 0 && (
          <div className="flex flex-col items-center mb-12">
            <div className={`text-5xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={averageRating} className="mt-2" />
            <p className={`text-sm mt-2 ${dark ? "text-gray-400" : "text-gray-600"}`}>
              Average across {reviews.length} recent {reviews.length === 1 ? "review" : "reviews"}
            </p>
          </div>
        )}

        {reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews yet"
            message="Reviews appear here after buyers and farmers complete their first orders together."
            dark={dark}
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <motion.figure
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className={card}
              >
                <Quote className="w-7 h-7 text-amber-500/50 mb-3" aria-hidden="true" />
                <StarRating rating={review.rating} className="mb-3" />
                <blockquote className={`flex-1 mb-4 ${dark ? "text-gray-300" : "text-gray-700"}`}>
                  {review.comment || "Rated without a written comment."}
                </blockquote>
                <figcaption className={`flex items-center gap-3 pt-4 border-t ${dark ? "border-gray-700" : "border-gray-100"}`}>
                  <Avatar initial={review.reviewerInitial} name={review.reviewerName} size="sm" />
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold truncate ${dark ? "text-white" : "text-gray-900"}`}>
                      {review.reviewerName}
                    </div>
                    <div className={`text-xs truncate ${dark ? "text-gray-400" : "text-gray-600"}`}>
                      {review.productName ? `on ${review.productName}` : review.reviewedName ? `reviewed ${review.reviewedName}` : "Verified order"}
                    </div>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
