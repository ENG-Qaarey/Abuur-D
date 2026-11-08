import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import AuthPanel from "@/components/auth/auth-panel";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Open Your Store | ABUUR Digital",
  description: "Create your ABUUR Digital account and start taking orders on WhatsApp.",
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell footer={false} navbar={false}>
      <AuthPanel mode="register" />
    </AuthShell>
  );
}
