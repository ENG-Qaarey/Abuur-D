import { PageHeader, Panel } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";
import { CONTACT_EMAIL } from "@/lib/routes";

const SECTIONS = [
  {
    title: "General",
    subtitle: "How ABUUR presents itself.",
    rows: [
      ["Platform name", "ABUUR Digital"],
      ["Public site", "abuur.so"],
      ["Store links", "abuur.so/<store-slug>"],
      ["Support email", CONTACT_EMAIL],
    ],
  },
  {
    title: "Regional",
    subtitle: "Defaults for dates, money and phone numbers.",
    rows: [
      ["Time zone", "Africa/Mogadishu (EAT, UTC+3)"],
      ["Default currency", "USD"],
      ["Phone country code", "+252 (Somalia)"],
      ["Language", "English"],
    ],
  },
  {
    title: "Ordering & payments",
    subtitle: "How orders and money move.",
    rows: [
      ["Checkout", "Cart sent to the owner's WhatsApp"],
      ["In-app payments", "Off: payment is agreed off-platform"],
      ["New businesses", "Need Super Admin approval"],
    ],
  },
  {
    title: "Security",
    subtitle: "Session and access rules.",
    rows: [
      ["Admin console access", "Super Admin only"],
      ["Session cookie", "httpOnly, SameSite=Lax"],
      ["Critical actions", "Confirmation required, audit logged"],
    ],
  },
];

export default async function SettingsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Platform Settings" subtitle="Platform-wide configuration. Read-only until a settings API exists." />
      <div className="grid gap-5 lg:grid-cols-2">
        {SECTIONS.map((s) => (
          <Panel key={s.title} title={s.title} subtitle={s.subtitle}>
            <dl className="divide-y divide-cl-border text-sm">
              {s.rows.map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-cl-muted">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        ))}
      </div>
    </div>
  );
}
