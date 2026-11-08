import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import AuthPanel from "@/components/auth/auth-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Login | ABUUR Digital",
  description: "Sign in to ABUUR Digital to manage your store, products and WhatsApp orders.",
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell footer={false} navbar={false}>
      <AuthPanel mode="login" />
    </AuthShell>
  );
}
