import Link from "next/link";
import { Building2, Store } from "lucide-react";
import { EmptyRow, ErrorNote, KpiGrid, PageHeader, Panel, StatusPill, Table } from "@/components/admin/ui";
import { loadBusinesses, requireSuperAdmin } from "@/lib/admin";
import { adminRoutes as r } from "@/lib/routes";

export default async function StoresPage() {
  const { token } = await requireSuperAdmin();
  const biz = await loadBusinesses(token);
  const withStores = biz.data.items.filter((b) => b.storeCount > 0).sort((a, b) => b.storeCount - a.storeCount);
  const total = biz.data.items.reduce((a, b) => a + b.storeCount, 0);

  return (
    <div className="w-full min-w-0 space-y-6">
      <PageHeader title="Store Management" subtitle="Registered stores, their products and reported content." />
      <ErrorNote message={biz.error} />
      <KpiGrid
        items={[
          { label: "Stores", value: String(total), sub: "across all businesses", icon: Store, tone: "blue" },
          { label: "Businesses with a store", value: String(withStores.length), sub: `of ${biz.data.items.length} businesses`, icon: Building2, tone: "emerald" },
        ]}
      />
      <Panel title="Stores by business" subtitle="Per-store details and reported content need a Super Admin /stores endpoint.">
        <Table head={["Business", "Stores", "Status", "Store link"]}>
          {withStores.length === 0 ? (
            <EmptyRow cols={4}>No stores created yet.</EmptyRow>
          ) : (
            withStores.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link href={r.business(b.id)} className="font-semibold hover:text-cl-blue">
                    {b.name}
                  </Link>
                </td>
                <td>{b.storeCount}</td>
                <td>
                  <StatusPill status={b.status} />
                </td>
                <td className="text-cl-muted">abuur.so/{b.slug}</td>
              </tr>
            ))
          )}
        </Table>
      </Panel>
    </div>
  );
}
