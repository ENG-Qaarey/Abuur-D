import { verifySupabaseToken as verifyWithAdmin } from '../lib/supabase';

export interface SupabaseClaims {
  sub: string;
  email: string | null;
  phone: string | null;
  is_anonymous: boolean;
  /** From user_metadata set at sign-up (profile only, never used for identity). */
  first_name: string | null;
  last_name: string | null;
  aud: string;
  role: string;
  iss: string;
  iat: number;
  exp: number;
}

function metaName(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 80) : null;
}

/**
 * Verify a Supabase Auth access token (JWT) using the service-role client.
 * Checks signature, issuer, audience, and expiry.
 */
export async function verifySupabaseToken(accessToken: string): Promise<SupabaseClaims> {
  const user = await verifyWithAdmin(accessToken);

  return {
    sub: user.id,
    email: user.email ?? null,
    phone: user.phone ?? null,
    is_anonymous: Boolean(user.is_anonymous ?? user.app_metadata?.is_anonymous),
    first_name: metaName(user.user_metadata?.first_name),
    last_name: metaName(user.user_metadata?.last_name),
    aud: user.aud ?? 'authenticated',
    role: user.role ?? 'authenticated',
    iss: user.aud ? '' : '',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
}
