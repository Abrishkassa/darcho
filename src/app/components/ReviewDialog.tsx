"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Loader2, X } from "lucide-react";

export interface ReviewTarget {
  orderId: number;
  orderNumber: string;
  productName: string | null;
  counterpartyName: string;
  counterpartyRole: "farmer" | "buyer";
  /** Pre-filled when editing an existing review. */
  existingRating?: number;
  existingComment?: string | null;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

/**
 * Rate & review dialog.
 *
 * Used by both the buyer and the farmer orders pages. The reviewer is always
 * the signed-in user; the reviewed party is derived server-side from the order,
 * so nothing here can be pointed at somebody the user never traded with.
 */
export function ReviewDialog({
  target,
  onClose,
  onSubmitted,
}: {
  target: ReviewTarget;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(target.existingRating ?? 0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(target.existingComment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstStarRef = useRef<HTMLButtonElement>(null);

  const isEditing = target.existingRating != null;
  const shown = hovered || rating;

  // Close on Escape, and keep focus inside the dialog while it is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Prevent the page behind from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    firstStarRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const submit = async () => {
    if (rating < 1) {
      setError("Choose a rating from 1 to 5 stars.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: target.orderId, rating, comment }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit review");
      }

      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-dialog-title"
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl max-h-[92vh] overflow-y-auto"
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <h2
                  id="review-dialog-title"
                  className="text-lg font-bold text-gray-900 dark:text-white"
                >
                  {isEditing ? "Update your review" : "Rate & review"}
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {target.counterpartyRole === "farmer" ? "Farmer" : "Buyer"}:{" "}
                  <span className="font-medium text-gray-900 dark:text-gray-200">
                    {target.counterpartyName}
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close review dialog"
                className="shrink-0 p-2 -m-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* What is being reviewed */}
            <div className="mb-6 rounded-xl bg-gray-50 dark:bg-gray-900/40 px-4 py-3 text-sm">
              <div className="text-gray-900 dark:text-gray-200 font-medium truncate">
                {target.productName || "Coffee order"}
              </div>
              <div className="mt-0.5 text-gray-500 dark:text-gray-400 text-xs">
                Order {target.orderNumber}
              </div>
            </div>

            {/* Stars */}
            <fieldset className="mb-6">
              <legend className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-3">
                Your rating
              </legend>
              <div
                className="flex items-center gap-1"
                onMouseLeave={() => setHovered(0)}
              >
                {[1, 2, 3, 4, 5].map((value, index) => (
                  <button
                    key={value}
                    ref={index === 0 ? firstStarRef : undefined}
                    type="button"
                    onClick={() => {
                      setRating(value);
                      setError(null);
                    }}
                    onMouseEnter={() => setHovered(value)}
                    onFocus={() => setHovered(value)}
                    onBlur={() => setHovered(0)}
                    aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                    aria-pressed={rating === value}
                    className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                  >
                    <Star
                      className={`w-9 h-9 transition-colors ${
                        value <= shown
                          ? "fill-amber-500 text-amber-500"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[4.5rem]">
                  {shown > 0 ? RATING_LABELS[shown] : ""}
                </span>
              </div>
              <p className="sr-only" aria-live="polite">
                {rating > 0 ? `Selected rating: ${rating} out of 5` : "No rating selected"}
              </p>
            </fieldset>

            {/* Comment */}
            <div className="mb-6">
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-gray-900 dark:text-gray-200 mb-2"
              >
                Comment <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                rows={4}
                maxLength={1000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the coffee, the communication, the delivery?"
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
              />
              <div className="mt-1 text-right text-xs text-gray-400 tabular-nums">
                {comment.length}/1000
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400"
              >
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={submitting || rating < 1}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                {submitting ? "Submitting…" : isEditing ? "Update review" : "Submit review"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Compact read-only display of a review already left on an order. */
export function ReviewBadge({
  rating,
  comment,
  byCounterparty,
}: {
  rating: number;
  comment: string | null;
  byCounterparty?: boolean;
}) {
  return (
    <div className="inline-flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
        <span className="inline-flex items-center gap-0.5" aria-hidden="true">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i <= rating
                  ? "fill-amber-500 text-amber-500"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
        </span>
        <span className="sr-only">{rating} out of 5</span>
        <span>
          {byCounterparty ? "Written by the other party" : "Your review"}
        </span>
      </span>
      {comment && (
        <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[16rem]">
          “{comment}”
        </span>
      )}
    </div>
  );
}
