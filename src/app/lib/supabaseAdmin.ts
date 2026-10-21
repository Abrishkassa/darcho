import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service role key.
 *
 * NEVER import this into a client component — the service role key bypasses
 * Row Level Security and must never reach the browser. It is only used by
 * API routes that have already verified the caller's session.
 *
 * The client is created lazily so that a missing key fails at request time
 * with a clear error, rather than at import time (which would break builds
 * and any page that merely happens to bundle this module).
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }

  if (!serviceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to your environment (server-only, never NEXT_PUBLIC_).'
    );
  }

  cached = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cached;
}
