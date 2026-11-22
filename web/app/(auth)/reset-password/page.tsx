import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { routes } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Set a new password | ABUUR Digital",
  description: "Choose a new password for your ABUUR Digital account.",
  robots: { index: false, follow: false },
};

/** Reached from the reset email via /auth/callback, which leaves a Supabase session behind. */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect(routes.forgotPassword);
  return <AuthForm mode="reset" />;
}
