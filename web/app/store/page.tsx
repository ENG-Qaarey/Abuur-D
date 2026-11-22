import { ArrowRight, Boxes, Building2, Clipboard, Users, CreditCard, Clock, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { getToken } from "@/lib/session";

export default async function StoreDashboard() {
  const token = (await getToken()) as string;
  const businesses = await api<any[]>("/businesses", { token });
  const business = businesses.ok ? businesses.data.find((item) => item.status === "ACTIVE") ?? businesses.data[0] : null;
  const businessId = business?.id;
  const [stores, products, categories, orders, customers, inventory] = businessId ? await Promise.all([
    api<any[]>("/stores", { token, businessId }),
    api<any[]>("/products", { token, businessId }),
    api<any[]>("/product-categories", { token, businessId }),
    api<any[]>("/store-orders", { token, businessId }),
    api<any[]>("/store-customers", { token, businessId }),
    api<any[]>("/inventory-movements", { token, businessId }),
  ]) : [null, null, null, null, null, null];
  const storeRows = stores?.ok ? stores.data : [];
  const productRows = products?.ok ? products.data : [];
  const categoryRows = categories?.ok ? categories.data : [];
  const orderRows = orders?.ok ? orders.data : [];
  const customerRows = customers?.ok ? customers.data : [];
  const inventoryRows = inventory?.ok ? inventory.data : [];
  const merchantSales = orderRows.reduce((sum, order) => sum + Number(order.total || 0), 0);
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">Store Dashboard</h1>
          <p className="mt-1 text-sm text-cl-muted">Manage products, orders, and inventory for your store.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">My store</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Building2 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{storeRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{storeRows.filter((item) => item.status === "ACTIVE").length} active</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Products</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600"><Boxes size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{productRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{productRows.filter((item) => item.status === "ACTIVE").length} active</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Categories</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600"><ArrowRight size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{categoryRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">catalog categories</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Orders</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-600"><Clipboard size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{orderRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">{orderRows.filter((item) => item.status === "DELIVERED").length} delivered</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Customers</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600"><Users size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{customerRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">store customers</p>
        </div>
        <div className="cl-card cl-panel flex flex-col p-4">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-cl-muted">Inventory</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600"><Building2 size={16} /></span>
          <p className="mt-2 text-2xl font-bold">{inventoryRows.length}</p>
          <p className="mt-0.5 text-xs text-cl-muted">USD {merchantSales.toLocaleString("en-US", { maximumFractionDigits: 2 })} sales</p>
        </div>
      </div>

      <div className="cl-card cl-panel p-6">
        <h2 className="text-lg font-semibold text-cl-text mb-4">Recent orders</h2>
        {orderRows.length === 0 ? (
          <p className="rounded-lg border border-dashed border-cl-border py-8 text-center text-sm text-cl-muted">No store orders found for {business?.name ?? "this account"}.</p>
        ) : (
          <div className="-mx-6 overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-cl-border text-left text-xs text-cl-muted"><th className="px-6 py-3">Order</th><th>Customer</th><th>Status</th><th>Payment</th><th>Total</th></tr></thead><tbody>{orderRows.slice(0,10).map((order) => <tr key={order.id} className="border-b border-cl-border last:border-0"><td className="px-6 py-3 font-semibold">{order.orderNumber}</td><td>{order.customerName ?? "Guest"}</td><td>{order.status}</td><td>{order.paymentStatus}</td><td>{order.currency} {Number(order.total).toLocaleString()}</td></tr>)}</tbody></table></div>
        )}
      </div>
    </div>
  );
}
