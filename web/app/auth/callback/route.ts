import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { startSessionFromSupabase } from "@/lib/session";
import { createClient } from "@/lib/supabase/server";

/** Only same-site paths, so the link can't be turned into an open redirect. */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/dashboard";
  return next;
}

/**
 * Landing point for links in Supabase emails (confirm sign-up, reset password).
 * Supports both the PKCE `?code=` link and the `?token_hash=&type=` template link,
 * then starts the ABUUR session and continues to `next`.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const next = safeNext(params.get("next"));
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let accessToken: string | undefined;

  if (code) {
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    accessToken = data.session?.access_token;
  } else if (tokenHash && type) {
    const { data } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    accessToken = data.session?.access_token;
  }

  // Expired or already-used links arrive with ?error=…, or fail the exchange above.
  if (!accessToken) redirect("/login?error=link");

  const exchanged = await startSessionFromSupabase(accessToken);
  if (!exchanged.ok) redirect("/login?error=account");

  redirect(next);
}
