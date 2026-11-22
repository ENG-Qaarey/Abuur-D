import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only where a Supabase session matters: auth pages, the email-link callback and signed-in areas.
  matcher: ["/login", "/register", "/forgot-password", "/reset-password", "/auth/:path*", "/dashboard/:path*", "/admin/:path*"],
};
