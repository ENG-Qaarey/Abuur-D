import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  Boxes,
  ClipboardList,
  Clock,
  Inbox,
  LogOut,
  MessageCircle,
  PartyPopper,
  Store,
} from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { CreateBusinessForm } from "@/components/dashboard/create-business-form";
import { api } from "@/lib/api";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser, getToken } from "@/lib/session";
import type { Business } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard | ABUUR Digital",
  robots: { index: false, follow: false },
};

type ContactMessage = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
};

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  PENDING_APPROVAL: { label: "Waiting for approval", className: "bg-amber-500/15 text-amber-600 dark:text-amber-300" },
  ACTIVE: { label: "Active", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" },
  SUSPENDED: { label: "Suspended", className: "bg-red-500/15 text-red-600 dark:text-red-300" },
  REJECTED: { label: "Not approved", className: "bg-red-500/15 text-red-600 dark:text-red-300" },
};

const NEXT_MODULES = [
  { icon: Store, title: "Store builder", text: "Design your storefront and share your link." },
  { icon: Boxes, title: "Products", text: "Add products, prices, photos and stock." },
  { icon: ClipboardList, title: "Orders", text: "Follow WhatsApp orders from New to Delivered." },
];

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const token = (await getToken()) as string;
  const { welcome } = await searchParams;

  const isPlatformAdmin = user.platformRole === "ADMIN" || user.platformRole === "SUPER_ADMIN";
  const [businessesResult, messagesResult] = await Promise.all([
    api<Business[]>("/businesses", { token }),
    isPlatformAdmin ? api<ContactMessage[]>("/contact-messages?status=NEW", { token }) : null,
  ]);
  const businesses = businessesResult.ok ? businessesResult.data : [];
  const messages = messagesResult?.ok ? messagesResult.data : [];
  const displayName = user.firstName || user.email || "there";

  return (
    <div className="min-h-screen bg-cl-main text-cl-text">
      <header className="site-header sticky top-0 z-50 border-b border-cl-border/40 backdrop-blur-md">
        <div className="cl-container flex h-[4.25rem] items-center justify-between gap-4">
          <Logo />
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-cl-muted sm:inline">{user.email}</span>
            <ThemeToggle />
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-cl-border px-3 text-sm font-medium text-cl-text transition hover:bg-cl-blue-light hover:text-cl-blue"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <section className="page-hero relative overflow-hidden border-b border-cl-border/30">
        <div className="hero-bg absolute inset-0" aria-hidden>
          <div className="hero-bg__gradient" />
        </div>
        <div className="cl-container relative z-[1] py-10 sm:py-12">
          <p className="cl-section-label">Dashboard</p>
          <h1 className="cl-heading mt-2 text-3xl sm:text-4xl">Hello, {displayName}</h1>
          <p className="cl-subtext mt-3 max-w-2xl">
            {businesses.length > 0
              ? "Here's an overview of your businesses on ABUUR."
              : "Let's get your business set up so you can start taking orders."}
          </p>
        </div>
      </section>

      <main className="cl-container space-y-8 py-10">
        {welcome && (
          <p role="status" className="flex items-start gap-3 rounded-xl border border-cl-success/40 bg-cl-success/10 px-5 py-4 text-sm">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0 text-cl-success" />
            Your account is ready. Welcome to ABUUR Digital! Add your business below to get started.
          </p>
        )}

        {!businessesResult.ok && (
          <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 px-5 py-4 text-sm">
            {businessesResult.message}
          </p>
        )}

        {isPlatformAdmin && (
          <section className="cl-card cl-panel p-6">
            <div className="flex items-center gap-3">
              <Inbox className="h-5 w-5 text-cl-blue" />
              <h2 className="text-lg font-semibold">Website messages</h2>
              <span className="rounded-full bg-cl-blue-light px-2.5 py-0.5 text-xs font-semibold text-cl-blue">
                {messages.length} new
              </span>
            </div>
            {messages.length === 0 ? (
              <p className="mt-3 text-sm text-cl-muted">No new messages from the contact form.</p>
            ) : (
              <ul className="mt-4 divide-y divide-cl-border">
                {messages.slice(0, 10).map((m) => (
                  <li key={m.id} className="py-3">
                    <p className="text-sm font-semibold">
                      {m.name}
                      {m.businessName && <span className="font-normal text-cl-muted"> · {m.businessName}</span>}
                      <span className="ml-2 rounded bg-cl-blue-light px-1.5 py-0.5 text-[0.7rem] font-semibold text-cl-blue">
                        {m.topic}
                      </span>
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-cl-muted">{m.message}</p>
                    <p className="mt-1 text-xs text-cl-muted">
                      {[m.email, m.phone].filter(Boolean).join(" · ")} ·{" "}
                      {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {businesses.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold">Your businesses</h2>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              {businesses.map((b) => {
                const status = STATUS_STYLE[b.status] ?? { label: b.status, className: "bg-cl-blue-light text-cl-blue" };
                return (
                  <article key={b.id} className="cl-card cl-panel p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cl-blue text-base font-bold text-white">
                          {b.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{b.name}</h3>
                          <p className="text-sm text-cl-muted">abuur.so/{b.slug}</p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                    {b.description && <p className="mt-4 text-sm text-cl-muted">{b.description}</p>}
                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <dt className="text-xs text-cl-muted">Your role</dt>
                        <dd className="font-medium capitalize">{b.myRole.toLowerCase()}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-cl-muted">Orders on WhatsApp</dt>
                        <dd className="inline-flex items-center gap-1.5 font-medium">
                          <MessageCircle size={14} className="text-cl-success" />
                          {b.phone ?? "Not set"}
                        </dd>
                      </div>
                    </dl>
                    {b.status === "PENDING_APPROVAL" && (
                      <p className="mt-4 flex items-start gap-2 rounded-lg bg-cl-main/60 px-3 py-2 text-xs text-cl-muted">
                        <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        The ABUUR team reviews new businesses. You&apos;ll be able to publish your store once it&apos;s approved.
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        <section className="cl-card cl-panel p-6 sm:p-8">
          <h2 className="text-lg font-semibold">{businesses.length > 0 ? "Add another business" : "Add your business"}</h2>
          <p className="mt-1 text-sm text-cl-muted">
            Every store on ABUUR belongs to a business. You&apos;ll be its owner.
          </p>
          <div className="mt-6">
            <CreateBusinessForm />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold">Coming to your dashboard</h2>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {NEXT_MODULES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-dashed border-cl-border bg-cl-card/60 p-5">
                <Icon className="h-5 w-5 text-cl-blue" />
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-cl-muted">{text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
