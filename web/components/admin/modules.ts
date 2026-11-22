/** ABUUR platform modules and how far each one is (read-only catalogue until a feature-flag API exists). */
export const MODULES = [
  {
    name: "CRM & Business Management",
    area: "Module 1",
    status: "BETA",
    about: "Manage clients, leads, sales pipelines, packages, payments, roles and business operations.",
    features: [
      "Client & lead management",
      "Sales pipeline",
      "Service packages & subscriptions",
      "Payment & renewal tracking",
      "User roles & permissions",
      "Admin dashboard",
    ],
  },
  {
    name: "Creative Production & Approval",
    area: "Module 2",
    status: "BETA",
    about: "Coordinate briefs, creative projects, tasks, files and approval workflows.",
    features: [
      "Content requests & briefs",
      "Project & task management",
      "Team assignment & deadlines",
      "File uploads & media library",
      "Client review & approval",
      "Revisions & final delivery",
    ],
  },
  {
    name: "WhatsApp Marketing & SMS",
    area: "Module 3",
    status: "BETA",
    about: "Manage contacts, messaging templates, campaigns, automation and consent.",
    features: [
      "WhatsApp API & SMS integration",
      "Contact management & segmentation",
      "Message templates",
      "Campaign creation & scheduling",
      "Automated messaging",
      "Delivery tracking & analytics",
      "Consent & opt-out management",
    ],
  },
  {
    name: "Stores & E-commerce",
    area: "Module 4",
    status: "BETA",
    about: "Create stores, manage catalogues, inventory, orders and WhatsApp checkout.",
    features: [
      "Store creation & store profile",
      "Store link & custom domain support",
      "Product catalog & categories",
      "Pricing, images & stock management",
      "Online storefront",
      "Order management & tracking",
      "WhatsApp order handoff",
      "Dropshipping product management",
    ],
  },
  {
    name: "Finance, Analytics & Reporting",
    area: "Module 5",
    status: "BETA",
    about: "Track merchant finances and produce platform analytics and downloadable reports.",
    features: [
      "Revenue & expense management",
      "Client payment tracking",
      "Subscription reports",
      "Marketing campaign reports",
      "Store sales reports",
      "Business performance dashboard",
      "Report export",
    ],
  },
] as const;

export const FLAGS = [
  { key: "store.custom_domains", about: "Let businesses connect their own domain to a store." },
  { key: "orders.whatsapp_checkout", about: "Send carts to the owner's WhatsApp as orders." },
  { key: "marketing.sms_campaigns", about: "SMS campaigns to +252 numbers." },
  { key: "auth.phone_otp", about: "Phone number sign-in with a one-time code." },
] as const;
