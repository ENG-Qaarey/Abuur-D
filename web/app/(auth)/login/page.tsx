import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Sign in | ABUUR Digital",
  description: "Sign in to ABUUR Digital to manage your store, products and WhatsApp orders.",
};

/** Set by /auth/callback when an email link can't sign the visitor in. */
const NOTICES: Record<string, string> = {
  link: "That link has expired or was already used. Sign in, or request a new link.",
  account: "We couldn't open your ABUUR account. Please try signing in again.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  const { error } = await searchParams;
  return <AuthForm mode="login" notice={error ? NOTICES[error] : undefined} />;
}
