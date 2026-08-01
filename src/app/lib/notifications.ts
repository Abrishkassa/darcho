import { supabase } from './supabase';

export type NotificationType = 'new_order' | 'order_status_change' | 'new_message';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId?: number | null;
}

/**
 * Insert a notification for a user. Failures are logged but never thrown —
 * a notification failing to send should never break the order/chat action
 * that triggered it.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  relatedOrderId = null,
}: CreateNotificationParams): Promise<void> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      related_order_id: relatedOrderId,
      is_read: false,
    });

    if (error) {
      console.error('Failed to create notification:', error);
    }
  } catch (err) {
    console.error('Failed to create notification:', err);
  }
}
