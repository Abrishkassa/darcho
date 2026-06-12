import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user with farmer profile
    const { data: user } = await supabase
      .from('users')
      .select('*, farmers(*)')
      .eq('email', session.user.email)
      .single();

    if (!user?.farmers) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    const farmerId = user.farmers.id;

    // Total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId);

    // Total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .neq('status', 'cart');

    // Active orders
    const { count: activeOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .in('status', ['pending', 'confirmed', 'processing']);

    // Pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .eq('status', 'pending');

    // Completed orders
    const { count: completedOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .eq('status', 'delivered');

    // Total revenue
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_price')
      .eq('farmer_id', farmerId)
      .eq('status', 'delivered');

    const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    // Monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: monthlyRevenueData } = await supabase
      .from('orders')
      .select('total_price')
      .eq('farmer_id', farmerId)
      .eq('status', 'delivered')
      .gte('order_date', thirtyDaysAgo.toISOString());

    const monthlyRevenue = monthlyRevenueData?.reduce((sum, o) => sum + (o.total_price || 0), 0) || 0;

    // Monthly orders count
    const { count: monthlyOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('farmer_id', farmerId)
      .neq('status', 'cart')
      .gte('order_date', thirtyDaysAgo.toISOString());

    // Recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select(`
        *,
        products ( name, grade ),
        buyers (
          users ( full_name, email )
        )
      `)
      .eq('farmer_id', farmerId)
      .neq('status', 'cart')
      .order('order_date', { ascending: false })
      .limit(10);

    // Low stock products
    const { data: lowStockProducts } = await supabase
      .from('products')
      .select('*')
      .eq('farmer_id', farmerId)
      .eq('status', 'available')
      .lt('quantity', 10)
      .order('quantity', { ascending: true })
      .limit(5);

    // All products for performance
    const { data: productPerformance } = await supabase
      .from('products')
      .select('id, name, grade, quantity, price_per_unit')
      .eq('farmer_id', farmerId)
      .limit(10);

    const formattedRecentOrders = (recentOrders || []).map(order => ({
      id: order.id,
      orderNumber: `ORD-${order.id.toString().padStart(6, '0')}`,
      productName: order.products?.name || 'Unknown Product',
      buyerName: order.buyers?.users?.full_name || 'Unknown Buyer',
      buyerEmail: order.buyers?.users?.email || '',
      quantity: order.quantity,
      totalPrice: order.total_price,
      status: order.status,
      orderDate: order.order_date,
      deliveryStatus: order.delivery_status || 'Pending',
      paymentStatus: order.payment_status || 'Pending'
    }));

    const formattedLowStock = (lowStockProducts || []).map(product => ({
      id: product.id,
      name: product.name,
      grade: product.grade || '',
      quantity: product.quantity,
      price: product.price_per_unit,
      status: product.status,
      origin: product.origin_region || '',
      altitude: product.altitude || ''
    }));

    const formattedProductPerformance = (productPerformance || []).map(product => ({
      productId: product.id,
      productName: product.name,
      grade: product.grade || '',
      price: product.price_per_unit,
      totalSold: 0,
      totalRevenue: 0,
      orderCount: 0
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalProducts: totalProducts || 0,
          totalOrders: totalOrders || 0,
          activeOrders: activeOrders || 0,
          pendingOrders: pendingOrders || 0,
          completedOrders: completedOrders || 0,
          totalRevenue,
          monthlyRevenue,
          monthlyOrders: monthlyOrders || 0,
          totalReviews: 0,
          averageRating: user.farmers.avg_rating || 0,
          unreadMessages: 0
        },
        recentOrders: formattedRecentOrders,
        lowStockProducts: formattedLowStock,
        topBuyers: [],
        recentMessages: [],
        salesData: [],
        productPerformance: formattedProductPerformance,
        farmerProfile: {
          ...user.farmers,
          farmName: user.farmers.farm_name || '',
          region: user.farmers.region || '',
          residence: user.farmers.residence || '',
          farmSize: user.farmers.farm_size || '',
          certifications: user.farmers.certifications || [],
          user: {
            fullName: user.full_name,
            email: user.email,
            phone: user.phone || ''
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching farmer dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    const { data: user } = await supabase
      .from('users')
      .select('*, farmers(*)')
      .eq('email', session.user.email)
      .single();

    if (!user?.farmers) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'updateProfile':
        const { data: updatedProfile } = await supabase
          .from('farmers')
          .update({
            farm_name: data.farmName,
            region: data.region,
            residence: data.residence,
            farm_size: data.farmSize,
            certifications: data.certifications
          })
          .eq('id', user.farmers.id)
          .select()
          .single();
        result = updatedProfile;
        break;

      case 'updateProduct':
        const { data: updatedProduct } = await supabase
          .from('products')
          .update({
            name: data.name,
            grade: data.grade,
            quantity: data.quantity,
            price_per_unit: data.price,
            status: data.status,
            origin_region: data.origin,
            altitude: data.altitude,
            description: data.description,
            certifications: data.certifications
          })
          .eq('id', data.id)
          .eq('farmer_id', user.farmers.id)
          .select()
          .single();
        result = updatedProduct;
        break;

      case 'addProduct':
        const { data: newProduct } = await supabase
          .from('products')
          .insert({
            ...data,
            farmer_id: user.farmers.id,
            status: 'available'
          })
          .select()
          .single();
        result = newProduct;
        break;

      case 'updateOrderStatus':
        const { data: updatedOrder } = await supabase
          .from('orders')
          .update({
            status: data.status,
            delivery_status: data.deliveryStatus,
            payment_status: data.paymentStatus
          })
          .eq('id', data.orderId)
          .eq('farmer_id', user.farmers.id)
          .select()
          .single();
        result = updatedOrder;
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `${action} updated successfully`
    });

  } catch (error) {
    console.error('Error updating farmer dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update data' },
      { status: 500 }
    );
  }
}