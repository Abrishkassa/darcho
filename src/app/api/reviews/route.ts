import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

export const runtime = 'nodejs';

/**
 * Reviews, for both sides of a trade.
 *
 * A review is never free-floating: it must reference a real order, and the
 * caller must be one of the two parties on that order. The database enforces
 * one review per order (`reviews.order_id` is UNIQUE), so this endpoint also
 * treats a second submission for the same order as an update to the caller's
 * own review rather than a new row.
 */

interface SessionUser {
  id: number;
  role: string;
  farmerId: number | null;
  buyerId: number | null;
}

/**
 * Shape of an order row with its joins.
 *
 * The Supabase client is untyped, so nested joins are inferred as arrays. In
 * this schema every join below is many-to-one, so PostgREST returns a single
 * object; these interfaces describe that and are cast at the query boundary.
 */
interface OrderRow {
  id: number;
  order_number: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  order_date: string;
  buyer_id: number;
  farmer_id: number;
  products: { name: string | null; unit: string | null } | null;
  buyers: {
    user_id: number | null;
    company_name: string | null;
    users: { full_name: string | null } | null;
  } | null;
  farmers: {
    user_id: number | null;
    farm_name: string | null;
    users: { full_name: string | null } | null;
  } | null;
}

interface ExistingReview {
  id: number;
  order_id: number;
  reviewer_id: number;
  reviewed_id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
}

/** Resolve the signed-in user plus whichever profile they have. */
async function resolveSessionUser(email: string): Promise<SessionUser | null> {
  const { data: user } = await supabase
    .from('users')
    .select('id, role')
    .eq('email', email)
    .single();

  if (!user) return null;

  // A user is a farmer, a buyer, or (rarely) has neither profile yet.
  const [{ data: farmer }, { data: buyer }] = await Promise.all([
    supabase.from('farmers').select('id').eq('user_id', user.id).maybeSingle(),
    supabase.from('buyers').select('id').eq('user_id', user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    role: user.role,
    farmerId: farmer?.id ?? null,
    buyerId: buyer?.id ?? null,
  };
}

/**
 * Recompute the average rating for whichever party was reviewed.
 *
 * `farmers.avg_rating` is read by the marketplace, the buyer dashboard, the
 * farmer's own profile and the homepage, but until now nothing ever wrote it —
 * the intended database trigger was never applied. Calculating it here, right
 * after the review is stored, keeps every one of those screens correct without
 * depending on database magic.
 *
 * Buyers have no stored rating column, so for a reviewed buyer this is a no-op.
 */
async function refreshReviewedAverage(
  reviewedUserId: number,
  reviewedRole: 'farmer' | 'buyer'
): Promise<void> {
  if (reviewedRole !== 'farmer') return;

  try {
    const { data: farmer } = await supabase
      .from('farmers')
      .select('id')
      .eq('user_id', reviewedUserId)
      .maybeSingle();

    if (!farmer) return;

    // Average every review this farmer has received.
    const { data: rows } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', reviewedUserId);

    const ratings = (rows || []).map((r) => r.rating).filter((r): r is number => typeof r === 'number');

    const average =
      ratings.length > 0
        ? Number((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2))
        : 0;

    await supabase.from('farmers').update({ avg_rating: average }).eq('id', farmer.id);
  } catch (error) {
    // A failed average must not fail the review the user just wrote.
    console.error('Failed to refresh average rating:', error);
  }
}

/**
 * GET /api/reviews
 *
 * Returns the orders this user is allowed to review, and the reviews they have
 * already written. Only orders the user actually took part in are returned,
 * and only once the order is delivered — you cannot rate coffee you have not
 * received.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await resolveSessionUser(session.user.email);
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Which orders belong to this user, and as which side?
    const constraints: string[] = [];
    if (me.buyerId != null) constraints.push(`buyer_id.eq.${me.buyerId}`);
    if (me.farmerId != null) constraints.push(`farmer_id.eq.${me.farmerId}`);

    if (constraints.length === 0) {
      return NextResponse.json({ success: true, data: { pending: [], written: [] } });
    }

    // The review is created by a user and points at the counterparty's user id.
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        quantity,
        unit_price,
        total_price,
        status,
        order_date,
        buyer_id,
        farmer_id,
        products ( name, unit ),
        buyers ( user_id, company_name, users ( full_name ) ),
        farmers ( user_id, farm_name, users ( full_name ) )
      `)
      .or(constraints.join(','))
      .eq('status', 'delivered')
      .order('order_date', { ascending: false });

    if (ordersError) throw ordersError;

    const orderRows = (orders || []) as unknown as OrderRow[];
    const orderIds = orderRows.map((o) => o.id);

    // Reviews already attached to any of those orders.
    const { data: existingReviews, error: reviewsError } = orderIds.length
      ? await supabase
          .from('reviews')
          .select('id, order_id, reviewer_id, reviewed_id, rating, comment, created_at')
          .in('order_id', orderIds)
      : { data: [], error: null };

    if (reviewsError) throw reviewsError;

    const reviewRows = (existingReviews || []) as unknown as ExistingReview[];

    // With two-way reviews there can be up to two rows per order, so these maps
    // separate this user's review from the counterparty's.
    const mineByOrder = new Map<number, ExistingReview>();
    const theirsByOrder = new Map<number, ExistingReview>();
    for (const review of reviewRows) {
      if (review.reviewer_id === me.id) mineByOrder.set(review.order_id, review);
      else theirsByOrder.set(review.order_id, review);
    }

    const pending: unknown[] = [];
    const written: unknown[] = [];

    for (const order of orderRows) {
      const isBuyerOnOrder = me.buyerId != null && order.buyer_id === me.buyerId;
      const counterparty = isBuyerOnOrder
        ? {
            userId: order.farmers?.user_id ?? null,
            name:
              order.farmers?.farm_name ||
              order.farmers?.users?.full_name ||
              'Farmer',
            role: 'farmer' as const,
          }
        : {
            userId: order.buyers?.user_id ?? null,
            name:
              order.buyers?.company_name ||
              order.buyers?.users?.full_name ||
              'Buyer',
            role: 'buyer' as const,
          };

      if (counterparty.userId == null) continue;

      const shape = {
        orderId: order.id,
        orderNumber: order.order_number,
        productName: order.products?.name ?? null,
        unit: order.products?.unit ?? 'kg',
        quantity: order.quantity,
        totalPrice: order.total_price,
        orderDate: order.order_date,
        counterpartyName: counterparty.name,
        counterpartyRole: counterparty.role,
        myRole: isBuyerOnOrder ? ('buyer' as const) : ('farmer' as const),
      };

      const mine = mineByOrder.get(order.id);
      const theirs = theirsByOrder.get(order.id);

      if (mine) {
        // This user has reviewed; row shows their own review and can be edited.
        written.push({
          ...shape,
          reviewId: mine.id,
          rating: mine.rating,
          comment: mine.comment,
          createdAt: mine.created_at,
          byCounterparty: false,
        });
      } else {
        // Still this user's turn — even if the counterparty already reviewed.
        pending.push({
          ...shape,
          counterpartyRating: theirs?.rating ?? null,
          counterpartyComment: theirs?.comment ?? null,
        });
      }
    }

    return NextResponse.json({ success: true, data: { pending, written } });
  } catch (error) {
    console.error('Error fetching reviewable orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 *
 * body: { orderId, rating, comment? }
 *
 * The reviewer is always the signed-in user, and the reviewed party is derived
 * from the order — never trusted from the client. This is what keeps reviews
 * tied to real, completed trades.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await resolveSessionUser(session.user.email);
    if (!me) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const orderId = Number(body?.orderId);
    const rating = Number(body?.rating);
    const comment =
      typeof body?.comment === 'string' && body.comment.trim().length > 0
        ? body.comment.trim().slice(0, 1000)
        : null;

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return NextResponse.json(
        { success: false, error: 'A valid order is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be a whole number from 1 to 5' },
        { status: 400 }
      );
    }

    // Load the order and confirm the caller is one of its two parties.
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, buyer_id, farmer_id, buyers ( user_id ), farmers ( user_id )')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const orderRow = order as unknown as {
      id: number;
      status: string;
      buyer_id: number;
      farmer_id: number;
      buyers: { user_id: number | null } | null;
      farmers: { user_id: number | null } | null;
    };

    // Only completed trades can be reviewed.
    if (orderRow.status !== 'delivered') {
      return NextResponse.json(
        {
          success: false,
          error: 'You can only review an order once it has been delivered',
        },
        { status: 400 }
      );
    }

    const isBuyerOnOrder = me.buyerId != null && orderRow.buyer_id === me.buyerId;
    const isFarmerOnOrder = me.farmerId != null && orderRow.farmer_id === me.farmerId;

    if (!isBuyerOnOrder && !isFarmerOnOrder) {
      return NextResponse.json(
        { success: false, error: 'You are not part of this order' },
        { status: 403 }
      );
    }

    // The person being reviewed is the other side of the trade.
    const reviewedUserId = isBuyerOnOrder
      ? orderRow.farmers?.user_id
      : orderRow.buyers?.user_id;

    if (!reviewedUserId) {
      return NextResponse.json(
        { success: false, error: 'The other party on this order no longer exists' },
        { status: 400 }
      );
    }

    if (reviewedUserId === me.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot review yourself' },
        { status: 400 }
      );
    }

    // One review per person per order. Update in place if this user already
    // wrote theirs; the counterparty having written one does not block this.
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('order_id', orderId)
      .eq('reviewer_id', me.id)
      .maybeSingle();

    if (existing) {
      const { data: updated, error: updateError } = await supabase
        .from('reviews')
        .update({ rating, comment })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) throw updateError;

      await refreshReviewedAverage(
        reviewedUserId,
        isBuyerOnOrder ? 'farmer' : 'buyer'
      );

      return NextResponse.json({
        success: true,
        message: 'Review updated',
        data: updated,
      });
    }

    const { data: created, error: insertError } = await supabase
      .from('reviews')
      .insert({
        order_id: orderId,
        reviewer_id: me.id,
        reviewed_id: reviewedUserId,
        rating,
        comment,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await refreshReviewedAverage(reviewedUserId, isBuyerOnOrder ? 'farmer' : 'buyer');

    return NextResponse.json({
      success: true,
      message: 'Review submitted',
      data: created,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit review';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
