import { AuthLayout } from "@/components/auth/auth-layout";

/** /login and /register share this frame so switching between them is seamless. */
export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}
