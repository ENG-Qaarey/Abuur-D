/** Configuration for the five main ABUUR SaaS modules and their entities. */

export type FieldType = "text" | "email" | "number" | "select" | "date" | "textarea";
export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Load options from an API endpoint (e.g. "businesses") instead of a static list. */
  optionsEndpoint?: string;
  /** Label field on the referenced record (default "name"). */
  labelKey?: string;
};

export type Column = { key: string; label: string };

export type EntityConfig = {
  slug: string;
  label: string;
  /** API path under /api (e.g. "crm-customers"). */
  endpoint: string;
  columns: Column[];
  fields: Field[];
};

export type ModuleConfig = {
  slug: string;
  name: string;
  area: string;
  description: string;
  features: string[];
  entities: EntityConfig[];
};

const BUSINESS: Field = { name: "businessId", label: "Business", type: "select", required: true, optionsEndpoint: "businesses", labelKey: "name" };
const STORE: Field = { name: "storeId", label: "Store", type: "select", required: true, optionsEndpoint: "stores", labelKey: "name" };
const PROJECT: Field = { name: "projectId", label: "Project", type: "select", required: true, optionsEndpoint: "creative-projects", labelKey: "title" };

export const MODULES: ModuleConfig[] = [
  {
    slug: "crm",
    name: "CRM & Business Management",
    area: "Module 1",
    description: "Manage clients, leads, sales pipelines, packages and business operations.",
    features: ["Client & lead management", "Sales pipeline", "Service packages", "Renewal tracking"],
    entities: [
      {
        slug: "customers",
        label: "Customers",
        endpoint: "crm-customers",
        columns: [
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "company", label: "Company" },
          { key: "status", label: "Status" },
        ],
        fields: [
          BUSINESS,
          { name: "name", label: "Name", type: "text", required: true },
          { name: "email", label: "Email", type: "email" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "company", label: "Company", type: "text" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "LEAD", label: "Lead" }, { value: "ONBOARDING", label: "Onboarding" },
            { value: "ACTIVE", label: "Active" }, { value: "AT_RISK", label: "At risk" }, { value: "CHURNED", label: "Churned" },
          ] },
        ],
      },
      {
        slug: "leads",
        label: "Leads",
        endpoint: "leads",
        columns: [
          { key: "title", label: "Title" },
          { key: "source", label: "Source" },
          { key: "value", label: "Value" },
          { key: "status", label: "Status" },
        ],
        fields: [
          BUSINESS,
          { name: "title", label: "Title", type: "text", required: true },
          { name: "source", label: "Source", type: "text", placeholder: "Referral, website…" },
          { name: "value", label: "Value", type: "number" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "NEW", label: "New" }, { value: "CONTACTED", label: "Contacted" },
            { value: "QUALIFIED", label: "Qualified" }, { value: "PROPOSAL", label: "Proposal" },
            { value: "NEGOTIATION", label: "Negotiation" }, { value: "WON", label: "Won" }, { value: "LOST", label: "Lost" },
          ] },
        ],
      },
    ],
  },
  {
    slug: "creative",
    name: "Creative Production",
    area: "Module 2",
    description: "Coordinate briefs, projects, tasks, files and client approval workflows.",
    features: ["Briefs & requests", "Projects & tasks", "Team assignment", "Client review & approval"],
    entities: [
      {
        slug: "projects",
        label: "Projects",
        endpoint: "creative-projects",
        columns: [
          { key: "title", label: "Title" },
          { key: "stage", label: "Stage" },
          { key: "status", label: "Status" },
          { key: "deadline", label: "Deadline" },
        ],
        fields: [
          BUSINESS,
          { name: "title", label: "Title", type: "text", required: true },
          { name: "description", label: "Description", type: "textarea" },
          { name: "stage", label: "Stage", type: "select", options: [
            { value: "BRIEF", label: "Brief" }, { value: "SCRIPTING", label: "Scripting" },
            { value: "SHOOTING", label: "Shooting" }, { value: "DESIGN", label: "Design" },
            { value: "EDITING", label: "Editing" }, { value: "CLIENT_REVIEW", label: "Client review" },
            { value: "DELIVERED", label: "Delivered" },
          ] },
          { name: "status", label: "Status", type: "select", options: [
            { value: "PLANNING", label: "Planning" }, { value: "IN_PROGRESS", label: "In progress" },
            { value: "ON_HOLD", label: "On hold" }, { value: "REVIEW", label: "Review" },
            { value: "COMPLETED", label: "Completed" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "deadline", label: "Deadline", type: "date" },
        ],
      },
      {
        slug: "requests",
        label: "Requests",
        endpoint: "creative-requests",
        columns: [
          { key: "title", label: "Title" },
          { key: "serviceType", label: "Service" },
          { key: "status", label: "Status" },
          { key: "deadline", label: "Deadline" },
        ],
        fields: [
          BUSINESS,
          { name: "title", label: "Title", type: "text", required: true },
          { name: "serviceType", label: "Service type", type: "text" },
          { name: "objective", label: "Objective", type: "textarea" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "SUBMITTED", label: "Submitted" }, { value: "REVIEWING", label: "Reviewing" },
            { value: "APPROVED", label: "Approved" }, { value: "IN_PROGRESS", label: "In progress" },
            { value: "WAITING_FOR_CLIENT", label: "Waiting for client" },
            { value: "COMPLETED", label: "Completed" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "deadline", label: "Deadline", type: "date" },
        ],
      },
      {
        slug: "tasks",
        label: "Tasks",
        endpoint: "creative-tasks",
        columns: [
          { key: "title", label: "Title" },
          { key: "status", label: "Status" },
          { key: "priority", label: "Priority" },
        ],
        fields: [
          PROJECT,
          { name: "title", label: "Title", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [
            { value: "TODO", label: "To do" }, { value: "IN_PROGRESS", label: "In progress" },
            { value: "REVIEW", label: "Review" }, { value: "COMPLETED", label: "Completed" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "priority", label: "Priority", type: "number" },
        ],
      },
    ],
  },
  {
    slug: "marketing",
    name: "WhatsApp & SMS Marketing",
    area: "Module 3",
    description: "Manage contacts, templates, campaigns, automation and consent.",
    features: ["Contacts & segments", "Message templates", "Campaigns", "Automation & consent"],
    entities: [
      {
        slug: "campaigns",
        label: "Campaigns",
        endpoint: "campaigns",
        columns: [
          { key: "name", label: "Name" },
          { key: "channel", label: "Channel" },
          { key: "status", label: "Status" },
          { key: "scheduledAt", label: "Scheduled" },
        ],
        fields: [
          BUSINESS,
          { name: "name", label: "Name", type: "text", required: true },
          { name: "channel", label: "Channel", type: "select", options: [
            { value: "WHATSAPP", label: "WhatsApp" }, { value: "SMS", label: "SMS" }, { value: "EMAIL", label: "Email" },
          ] },
          { name: "message", label: "Message", type: "textarea" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "DRAFT", label: "Draft" }, { value: "SCHEDULED", label: "Scheduled" },
            { value: "RUNNING", label: "Running" }, { value: "PAUSED", label: "Paused" },
            { value: "COMPLETED", label: "Completed" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
        ],
      },
      {
        slug: "contacts",
        label: "Contacts",
        endpoint: "marketing-contacts",
        columns: [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "whatsappConsent", label: "Consent" },
        ],
        fields: [
          BUSINESS,
          { name: "name", label: "Name", type: "text" },
          { name: "phone", label: "Phone", type: "text" },
          { name: "email", label: "Email", type: "email" },
          { name: "whatsappConsent", label: "WhatsApp opt-in", type: "select", options: [
            { value: "true", label: "Opted in" }, { value: "false", label: "Not opted in" },
          ] },
        ],
      },
      {
        slug: "templates",
        label: "Templates",
        endpoint: "message-templates",
        columns: [
          { key: "name", label: "Name" },
          { key: "channel", label: "Channel" },
          { key: "language", label: "Language" },
          { key: "status", label: "Status" },
        ],
        fields: [
          BUSINESS,
          { name: "name", label: "Name", type: "text", required: true },
          { name: "body", label: "Body", type: "textarea", required: true },
          { name: "channel", label: "Channel", type: "select", options: [
            { value: "WHATSAPP", label: "WhatsApp" }, { value: "SMS", label: "SMS" }, { value: "EMAIL", label: "Email" },
          ] },
          { name: "language", label: "Language", type: "text", placeholder: "so" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "DRAFT", label: "Draft" }, { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" }, { value: "REJECTED", label: "Rejected" }, { value: "PAUSED", label: "Paused" },
          ] },
        ],
      },
    ],
  },
  {
    slug: "stores",
    name: "Stores & E-commerce",
    area: "Module 4",
    description: "Create stores, manage catalogues, inventory, orders and WhatsApp checkout.",
    features: ["Store & catalogue", "Inventory", "Orders", "WhatsApp checkout"],
    entities: [
      {
        slug: "stores",
        label: "Stores",
        endpoint: "stores",
        columns: [
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "city", label: "City" },
          { key: "status", label: "Status" },
        ],
        fields: [
          BUSINESS,
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text", required: true },
          { name: "city", label: "City", type: "text" },
          { name: "whatsappNumber", label: "WhatsApp number", type: "text" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" },
            { value: "SUSPENDED", label: "Suspended" }, { value: "CLOSED", label: "Closed" },
          ] },
        ],
      },
      {
        slug: "products",
        label: "Products",
        endpoint: "products",
        columns: [
          { key: "name", label: "Name" },
          { key: "sku", label: "SKU" },
          { key: "price", label: "Price" },
          { key: "stock", label: "Stock" },
          { key: "status", label: "Status" },
        ],
        fields: [
          STORE,
          { name: "name", label: "Name", type: "text", required: true },
          { name: "slug", label: "Slug", type: "text" },
          { name: "sku", label: "SKU", type: "text" },
          { name: "price", label: "Price", type: "number" },
          { name: "stock", label: "Stock", type: "number" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "DRAFT", label: "Draft" }, { value: "ACTIVE", label: "Active" },
            { value: "ARCHIVED", label: "Archived" }, { value: "OUT_OF_STOCK", label: "Out of stock" },
          ] },
        ],
      },
      {
        slug: "orders",
        label: "Orders",
        endpoint: "store-orders",
        columns: [
          { key: "orderNumber", label: "Order" },
          { key: "status", label: "Status" },
          { key: "paymentStatus", label: "Payment" },
          { key: "total", label: "Total" },
        ],
        fields: [
          STORE,
          { name: "orderNumber", label: "Order number", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [
            { value: "NEW", label: "New" }, { value: "CONFIRMED", label: "Confirmed" },
            { value: "PREPARING", label: "Preparing" }, { value: "READY", label: "Ready" },
            { value: "DISPATCHED", label: "Dispatched" }, { value: "DELIVERED", label: "Delivered" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "paymentStatus", label: "Payment status", type: "select", options: [
            { value: "PENDING", label: "Pending" }, { value: "PAID", label: "Paid" },
            { value: "FAILED", label: "Failed" }, { value: "REFUNDED", label: "Refunded" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "total", label: "Total", type: "number" },
        ],
      },
    ],
  },
  {
    slug: "finance",
    name: "Finance, Analytics & Reporting",
    area: "Module 5",
    description: "Track invoices, payments, expenses, revenue and financial reporting.",
    features: ["Invoices", "Payments", "Transactions", "Reports & analytics"],
    entities: [
      {
        slug: "invoices",
        label: "Invoices",
        endpoint: "invoices",
        columns: [
          { key: "invoiceNumber", label: "Invoice" },
          { key: "status", label: "Status" },
          { key: "total", label: "Total" },
          { key: "dueDate", label: "Due" },
        ],
        fields: [
          BUSINESS,
          { name: "invoiceNumber", label: "Invoice number", type: "text", required: true },
          { name: "status", label: "Status", type: "select", options: [
            { value: "DRAFT", label: "Draft" }, { value: "SENT", label: "Sent" },
            { value: "PARTIALLY_PAID", label: "Partially paid" }, { value: "PAID", label: "Paid" },
            { value: "OVERDUE", label: "Overdue" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
          { name: "total", label: "Total", type: "number" },
        ],
      },
      {
        slug: "payments",
        label: "Payments",
        endpoint: "payments",
        columns: [
          { key: "amount", label: "Amount" },
          { key: "method", label: "Method" },
          { key: "status", label: "Status" },
        ],
        fields: [
          BUSINESS,
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "method", label: "Method", type: "text", placeholder: "EVC Plus, cash…" },
          { name: "status", label: "Status", type: "select", options: [
            { value: "PENDING", label: "Pending" }, { value: "PAID", label: "Paid" },
            { value: "FAILED", label: "Failed" }, { value: "PARTIALLY_PAID", label: "Partially paid" },
            { value: "REFUNDED", label: "Refunded" }, { value: "CANCELLED", label: "Cancelled" },
          ] },
        ],
      },
      {
        slug: "transactions",
        label: "Transactions",
        endpoint: "finance-transactions",
        columns: [
          { key: "type", label: "Type" },
          { key: "category", label: "Category" },
          { key: "amount", label: "Amount" },
          { key: "description", label: "Description" },
        ],
        fields: [
          BUSINESS,
          { name: "type", label: "Type", type: "select", options: [
            { value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expense" },
          ] },
          { name: "category", label: "Category", type: "text", required: true },
          { name: "amount", label: "Amount", type: "number", required: true },
          { name: "description", label: "Description", type: "textarea" },
        ],
      },
    ],
  },
];

export const moduleBySlug = (slug: string) => MODULES.find((m) => m.slug === slug);
