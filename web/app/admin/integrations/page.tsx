import { Mail, MessageCircle, MessageSquareText, Plug, Wallet, HardDrive } from "lucide-react";
import { CARD, NotConnected, PageHeader, StatusPill } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

const PROVIDERS = [
  { name: "Meta / WhatsApp Cloud API", about: "WhatsApp ordering and campaigns.", icon: MessageCircle },
  { name: "SMS gateway", about: "OTP and SMS campaigns to +252 numbers.", icon: MessageSquareText },
  { name: "Email", about: "Account and notification emails.", icon: Mail },
  { name: "Payments", about: "Mobile money and card providers.", icon: Wallet },
  { name: "Storage", about: "Product images and files.", icon: HardDrive },
  { name: "Other", about: "Custom webhooks and partners.", icon: Plug },
];

export default async function IntegrationsPage() {
  await requireSuperAdmin();
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <PageHeader title="Integrations" subtitle="Meta, WhatsApp, SMS and other external providers." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {PROVIDERS.map(({ name, about, icon: Icon }) => (
          <div key={name} className={`${CARD} flex items-start gap-3 p-4`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cl-blue-light text-cl-blue">
              <Icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-cl-muted">{about}</p>
            </div>
            <StatusPill status="PLANNED" label="Unknown" />
          </div>
        ))}
      </div>
      <NotConnected
        endpoint="GET /integration-connections"
        what="Connections are stored per business, but the endpoint has no access policy yet. Once enabled, each provider shows how many businesses are connected and which ones report errors."
      />
    </div>
  );
}
