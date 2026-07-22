import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { supabase } from './supabase';

export async function verifyFarmerSession(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return { isValid: false, error: 'No session found', farmerId: null };
    }

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', session.user.email)
      .single();

    if (userError || !user) {
      return { isValid: false, error: 'Invalid session', farmerId: null };
    }

    const { data: farmer, error: farmerError } = await supabase
      .from('farmers')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (farmerError || !farmer) {
      return { isValid: false, error: 'Not a farmer account', farmerId: null };
    }

    return {
      isValid: true,
      farmerId: farmer.id,
      userId: user.id,
      userRole: user.role,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return { isValid: false, error: 'Session verification failed', farmerId: null };
  }
}
