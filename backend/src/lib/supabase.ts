import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Supabase admin client (service role). Use only server-side.
 * Never expose the service role key to the browser.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    if (!config.supabaseUrl || !config.supabaseSecretKey) {
      throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY must be set');
    }
    supabaseAdmin = createClient(config.supabaseUrl, config.supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}

/**
 * Verify a Supabase Auth access token and return the user.
 * Throws if the token is invalid/expired.
 */
export async function verifySupabaseToken(accessToken: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Invalid Supabase token');
  }
  return data.user;
}
