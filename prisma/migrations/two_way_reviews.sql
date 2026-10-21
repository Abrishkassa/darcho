-- Two-way reviews
--
-- `reviews` originally had a UNIQUE index on `order_id` alone, so only one
-- review could ever exist per order. That made two-way reviews structurally
-- impossible: once the buyer rated the farmer, the farmer could not rate the
-- buyer back on the same trade.
--
-- Replacing it with UNIQUE (order_id, reviewer_id) allows exactly one review
-- per person per order, which is the correct rule: a buyer rates the farmer,
-- the farmer rates the buyer, and nobody can review the same trade twice.
--
-- Safe to run more than once.

DROP INDEX IF EXISTS "reviews_order_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "reviews_order_id_reviewer_id_key"
ON "reviews"("order_id", "reviewer_id");
