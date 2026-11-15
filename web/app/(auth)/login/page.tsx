import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign in | ABUUR Digital",
  description: "Sign in to ABUUR Digital to manage your store, products and WhatsApp orders.",
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return <AuthForm mode="login" />;
}
