import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from '@/app/lib/supabase';

export const runtime = 'nodejs';

async function getSessionUserId(): Promise<number | null> {
  const session = await getServerSession();
  if (!session?.user?.email) return null;

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('email', session.user.email)
    .single();

  return user?.id ?? null;
}

// GET /api/notifications - recent notifications + unread count for the logged-in user (farmer or buyer)
export async function GET(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (countError) throw countError;

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      userId,
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch notifications', notifications: [], unreadCount: 0 },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - mark one notification as read, or all of them
// body: { notificationId: number } or { markAllRead: true }
export async function PUT(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (body.markAllRead) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (body.notificationId) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', body.notificationId)
        .eq('user_id', userId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: 'notificationId or markAllRead is required' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
