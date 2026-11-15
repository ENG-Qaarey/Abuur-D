import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Forgot password | ABUUR Digital",
  description: "Request help to recover access to your ABUUR Digital account.",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="forgot" />;
}
