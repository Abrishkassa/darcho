import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('*, buyers(*)')
      .eq('email', session.user.email)
      .single();

    if (!user?.buyers) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const buyerId = user.buyers.id;

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', buyerId)
      .neq('status', 'cart');

    // Total spent
    const { data: spentData } = await supabase
      .from('orders')
      .select('total_price')
      .eq('buyer_id', buyerId)
      .neq('status', 'cart');

    const totalSpent = spentData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          farmers (
            farm_name,
            users ( full_name )
          )
        )
      `)
      .eq('buyer_id', buyerId)
      .neq('status', 'cart')
      .order('order_date', { ascending: false })
      .limit(5);

    // Recommended products
    const { data: recommendedProducts } = await supabase
      .from('products')
      .select(`
        *,
        farmers (
          farm_name,
          avg_rating,
          users ( full_name )
        )
      `)
      .eq('status', 'available')
      .gt('quantity', 0)
      .limit(6);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalOrders: totalOrders || 0,
          totalSpent,
          cartItems: 0,
          favorites: 0,
          activeChats: 0,
        },
        recentOrders: recentOrders || [],
        recommendedProducts: recommendedProducts || [],
        monthlyData: [],
        topFarmers: [],
        buyerProfile: user.buyers
      }
    });

  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}