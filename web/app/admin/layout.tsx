import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { fullName, initialsOf, lastDaysRange, loadBusinesses, loadMessages, requireSuperAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Admin | ABUUR Digital",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { user, token } = await requireSuperAdmin();
  const [pending, messages] = await Promise.all([loadBusinesses(token, "PENDING_APPROVAL"), loadMessages(token, "NEW")]);

  const name = fullName(user);
  const handle = user.email ? `@${user.email.split("@")[0]}` : name;

  return (
    <AdminShell
      user={{ name, handle, initials: initialsOf(name) }}
      dateRange={lastDaysRange(30)}
      alerts={pending.data.total + messages.data.length}
    >
      {children}
    </AdminShell>
  );
}
