import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { getCurrentUser } from "@/lib/session";
import { roleRoutes } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Open Your Store | ABUUR Digital",
  description: "Create your ABUUR Digital account and start taking orders on WhatsApp.",
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleRoutes[user.platformRole as keyof typeof roleRoutes]);
  return <AuthForm mode="register" />;
}
