/** ABUUR platform modules and how far each one is (read-only catalogue until a feature-flag API exists). */
export const MODULES = [
  { name: "Business accounts", area: "Core", status: "LIVE", about: "Sign-up, business profiles, approval and team members." },
  { name: "Plans & subscriptions", area: "Core", status: "BETA", about: "Owners pick a plan; payment is agreed off-platform." },
  { name: "Online stores", area: "Commerce", status: "BETA", about: "Each business gets a store at abuur.so/your-shop." },
  { name: "Product catalogue", area: "Commerce", status: "PLANNED", about: "Products, categories and inventory." },
  { name: "WhatsApp ordering", area: "Commerce", status: "PLANNED", about: "Cart checkout lands as an order in the owner's WhatsApp." },
  { name: "Order dashboard", area: "Commerce", status: "PLANNED", about: "Track orders from New to Delivered." },
  { name: "CRM & leads", area: "Growth", status: "PLANNED", about: "Customers, leads and communications." },
  { name: "Marketing campaigns", area: "Growth", status: "PLANNED", about: "WhatsApp and SMS campaigns." },
  { name: "Creative services", area: "Services", status: "PLANNED", about: "Creative requests, projects and reviews." },
  { name: "Finance & invoices", area: "Services", status: "PLANNED", about: "Invoices, payments and transactions." },
] as const;

export const FLAGS = [
  { key: "store.custom_domains", about: "Let businesses connect their own domain to a store." },
  { key: "orders.whatsapp_checkout", about: "Send carts to the owner's WhatsApp as orders." },
  { key: "marketing.sms_campaigns", about: "SMS campaigns to +252 numbers." },
  { key: "auth.phone_otp", about: "Phone number sign-in with a one-time code." },
] as const;
