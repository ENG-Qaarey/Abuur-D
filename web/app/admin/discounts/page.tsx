import { SubTabs } from "@/components/admin/client";
import { TABS } from "@/components/admin/tabs";
import { NotConnected, PageHeader } from "@/components/admin/ui";
import { requireSuperAdmin } from "@/lib/admin";

export default async function DiscountsPage() {
  await requireSuperAdmin();
  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Coupons & Discounts" subtitle="Promotional codes and discounts on ABUUR plans." />
      <SubTabs tabs={TABS.plans} />
      <NotConnected
        endpoint="/coupons"
        what="There is no coupon model in the backend yet. Once it exists, this page lists codes, their discount, usage limits and expiry."
        items={["Percentage or fixed discounts", "Usage limits per code", "Expiry dates", "Plans each code applies to"]}
      />
    </div>
  );
}
