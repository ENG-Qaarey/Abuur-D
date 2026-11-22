import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Forgot password | ABUUR Digital",
  description: "Request help to recover access to your ABUUR Digital account.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  return <AuthForm mode="forgot" />;
}
