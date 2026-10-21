import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export const runtime = 'nodejs';

interface FarmerWithUser {
  id: number;
  farm_name: string | null;
  region: string | null;
  residence: string | null;
  avg_rating: number | null;
  years_farming: number | null;
  certifications: string[] | null;
  profile_image_url: string | null;
  users: { full_name: string | null } | null;
  products: { id: number }[] | null;
}

interface BuyerWithUser {
  id: number;
  user_id: number;
  company_name: string | null;
  business_type: string | null;
  location: string | null;
  users: { full_name: string | null } | null;
  orders: { total_price: number | null }[] | null;
}

/** A rating a buyer has received, used to average it in code. */
interface BuyerRatingRow {
  reviewed_id: number;
  rating: number;
}

interface ReviewRow {
  id: number;
  rating: number;
  comment: string | null;
  created_at: string | null;
  reviewer: { full_name: string | null } | null;
  reviewed: { full_name: string | null } | null;
  order: { products: { name: string | null } | null } | null;
}

interface ProductRow {
  id: number;
  name: string | null;
  grade: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  price_per_unit: number | null;
  description: string | null;
  origin_region: string | null;
  image_urls: string[] | null;
  farmers: {
    farm_name: string | null;
    region: string | null;
    users: { full_name: string | null } | null;
  } | null;
}

function firstInitial(name: string | null | undefined): string {
  return (name || '').trim().charAt(0).toUpperCase() || '?';
}

/**
 * Public homepage statistics.
 *
 * Everything here is aggregated from real rows. Sections that have no data are
 * returned as empty arrays so the UI can render an honest empty state instead
 * of inventing numbers.
 */
export async function GET() {
  try {
    const [
      { count: farmerCount },
      { count: buyerCount },
      { count: productCount },
      { count: orderCount },
      { data: reviewRows },
      { data: farmerRows },
      { data: buyerRows },
      { data: productRows },
      { data: buyerRatingRowsRaw },
    ] = await Promise.all([
      supabase.from('farmers').select('*', { count: 'exact', head: true }),
      supabase.from('buyers').select('*', { count: 'exact', head: true }),
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'available'),
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'cart'),
      // Recent reviews with the parties and the product involved.
      supabase
        .from('reviews')
        .select(`
          id,
          rating,
          comment,
          created_at,
          reviewer:users!reviews_reviewer_id_fkey ( full_name ),
          reviewed:users!reviews_reviewed_id_fkey ( full_name ),
          order:orders ( products ( name ) )
        `)
        .order('created_at', { ascending: false })
        .limit(6),
      // Farmers for the spotlight. Rated growers sort first; the rest still
      // appear as new arrivals so the section is never an empty box.
      supabase
        .from('farmers')
        .select(`
          id,
          farm_name,
          region,
          residence,
          avg_rating,
          years_farming,
          certifications,
          profile_image_url,
          users ( full_name ),
          products!products_farmer_id_fkey ( id )
        `)
        .order('avg_rating', { ascending: false })
        .limit(6),
      // Buyers with their orders, so spend and volume can be ranked in code.
      // `user_id` is included because buyer ratings are stored against the
      // user, not the buyer profile.
      supabase
        .from('buyers')
        .select(`
          id,
          user_id,
          company_name,
          business_type,
          location,
          users ( full_name ),
          orders ( total_price )
        `)
        .limit(50),
      // The three newest live listings — the actual reason buyers land here.
      supabase
        .from('products')
        .select(`
          id,
          name,
          grade,
          category,
          quantity,
          unit,
          price_per_unit,
          description,
          origin_region,
          image_urls,
          farmers ( farm_name, region, users ( full_name ) )
        `)
        .eq('status', 'available')
        .gt('quantity', 0)
        .order('created_at', { ascending: false })
        .limit(3),
      // Ratings buyers have received from farmers. There is no stored buyer
      // rating column, so these are averaged in code below.
      supabase.from('reviews').select('reviewed_id, rating'),
    ]);

    const farmers = (farmerRows as unknown as FarmerWithUser[] | null) || [];
    const buyers = (buyerRows as unknown as BuyerWithUser[] | null) || [];
    const reviews = (reviewRows as unknown as ReviewRow[] | null) || [];
    const products = (productRows as unknown as ProductRow[] | null) || [];
    const buyerRatingRows =
      (buyerRatingRowsRaw as unknown as BuyerRatingRow[] | null) || [];

    // Average the ratings each buyer has received, keyed by user id since a
    // review points at a user rather than a buyer profile.
    const buyerRatings = new Map<number, { sum: number; count: number }>();
    for (const row of buyerRatingRows) {
      if (typeof row.rating !== 'number' || row.reviewed_id == null) continue;
      const entry = buyerRatings.get(row.reviewed_id) || { sum: 0, count: 0 };
      entry.sum += row.rating;
      entry.count += 1;
      buyerRatings.set(row.reviewed_id, entry);
    }

    // Rank buyers by how much they have actually purchased. Only buyers with a
    // completed line item count, so an idle account never appears as "trending".
    const rankedBuyers = buyers
      .map((b) => {
        const orders = (b.orders || []).filter((o) => o.total_price != null);
        const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);
        const ratingEntry = buyerRatings.get(b.user_id);
        return {
          id: b.id,
          name: b.company_name || b.users?.full_name || 'Buyer',
          businessType: b.business_type || null,
          location: b.location || null,
          orderCount: orders.length,
          totalSpent,
          // 0 means no farmer has rated this buyer yet; the UI hides the stars.
          rating: ratingEntry
            ? Number((ratingEntry.sum / ratingEntry.count).toFixed(1))
            : 0,
          ratingCount: ratingEntry?.count || 0,
          initial: firstInitial(b.company_name || b.users?.full_name),
        };
      })
      .filter((b) => b.orderCount > 0)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 6);

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          farmers: farmerCount || 0,
          buyers: buyerCount || 0,
          products: productCount || 0,
          orders: orderCount || 0,
          reviews: reviews.length,
          averageRating: Number(avgRating.toFixed(1)),
        },
        trendingFarmers: farmers.map((f) => ({
          id: f.id,
          name: f.farm_name || f.users?.full_name || 'Farmer',
          region: f.region || f.residence || null,
          rating: f.avg_rating || 0,
          yearsFarming: f.years_farming || null,
          certifications: f.certifications || [],
          imageUrl: f.profile_image_url || null,
          initial: firstInitial(f.farm_name || f.users?.full_name),
          listingCount: (f.products || []).length,
        })),
        trendingBuyers: rankedBuyers,
        latestProducts: products.map((p) => ({
          id: p.id,
          name: p.name || 'Coffee lot',
          grade: p.grade || null,
          category: p.category || null,
          quantity: p.quantity || 0,
          unit: p.unit || 'kg',
          pricePerUnit: p.price_per_unit || 0,
          description: p.description || null,
          originRegion: p.origin_region || p.farmers?.region || null,
          imageUrl: p.image_urls?.[0] || null,
          farmerName: p.farmers?.farm_name || p.farmers?.users?.full_name || null,
        })),
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating || 0,
          comment: r.comment || null,
          createdAt: r.created_at,
          reviewerName: r.reviewer?.full_name || 'Anonymous',
          reviewedName: r.reviewed?.full_name || null,
          productName: r.order?.products?.name || null,
          reviewerInitial: firstInitial(r.reviewer?.full_name),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load homepage statistics' },
      { status: 500 }
    );
  }
}
