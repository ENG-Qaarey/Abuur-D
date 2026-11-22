/**
 * Who may do what, per Prisma model (keyed by the client delegate name, e.g. `storeOrder`).
 * Default deny: a model without an entry here is SUPER_ADMIN only.
 *
 * kind 'business': rows belong to a business. `paths` are relation chains from the model to
 *   something with a `businessId` ([] = the model itself has `businessId`). Several paths = the
 *   row is shared by several businesses (e.g. a fulfillment: the store's and the supplier's).
 *   Access comes from the caller's ACTIVE BusinessMembership:
 *     - OWNER / ADMIN / MANAGER / EMPLOYEE / VIEWER use the role lists below (read/write/remove);
 *     - ACCOUNTANT / SALES_REP and members with a custom role use module permissions
 *       (ROLE_PERMISSIONS / BusinessRole.permissions) for the model's `module`.
 * kind 'self': rows belong to one user (`userField`).
 * kind 'admin': platform data, SUPER_ADMIN only.
 * kind 'custom': served by hand-written routes; the generic CRUD refuses it.
 *
 * SUPER_ADMIN passes every access check (field rules like systemFields still apply).
 */

export type MembershipRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'VIEWER' | 'ACCOUNTANT' | 'SALES_REP';

export const ALL_ROLES: MembershipRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE', 'VIEWER'];
export const STAFF: MembershipRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'EMPLOYEE'];
export const MANAGERS: MembershipRole[] = ['OWNER', 'ADMIN', 'MANAGER'];
export const ADMINS: MembershipRole[] = ['OWNER', 'ADMIN'];
export const OWNER: MembershipRole[] = ['OWNER'];

export const MODULES = ['crm', 'creative', 'marketing', 'store', 'finance', 'files', 'reports', 'team', 'settings'] as const;
export type Module = (typeof MODULES)[number];
export const ACTIONS = ['view', 'create', 'edit', 'delete', 'export', 'approve'] as const;
export type Action = (typeof ACTIONS)[number];
export type Permissions = Partial<Record<Module, Action[]>>;

/** Built-in module-permission roles. */
export const ROLE_PERMISSIONS: Partial<Record<MembershipRole, Permissions>> = {
  ACCOUNTANT: {
    finance: ['view', 'create', 'edit', 'export', 'approve'],
    crm: ['view'],
    store: ['view'],
    reports: ['view', 'export'],
    files: ['view', 'create'],
  },
  SALES_REP: {
    crm: ['view', 'create', 'edit'],
    store: ['view'],
    marketing: ['view'],
    creative: ['view'],
    reports: ['view'],
    files: ['view', 'create'],
  },
};

export type BusinessPolicy = {
  kind: 'business';
  paths: string[][];
  /** Module used for module-permission roles (no module = only the role lists apply). */
  module?: Module;
  /** Membership roles allowed to read / create+update / delete. */
  read?: MembershipRole[];
  write?: MembershipRole[];
  remove?: MembershipRole[];
  /** No create/update/delete through the API at all (system-written rows), except SUPER_ADMIN. */
  readOnly?: boolean;
  /** Only SUPER_ADMIN may set these fields. */
  adminFields?: string[];
  /** Field values only SUPER_ADMIN may set (e.g. suspending a store). */
  adminValues?: Record<string, string[]>;
  /** Changed only by workflow endpoints (history, stock, money): ignored in generic create/update. */
  systemFields?: string[];
  /** Settable when creating, then only through workflow endpoints. */
  createOnlyFields?: string[];
  /** Values that can only be reached through a workflow endpoint (e.g. lead status WON = convert). */
  workflowValues?: Record<string, string[]>;
  /** Never returned in responses (write-only secrets). */
  hiddenFields?: string[];
  /** Extra rows any signed-in user may read (marketplace catalog). */
  publicRead?: Record<string, unknown>;
  /** Write an audit log entry for generic updates and deletes. */
  audited?: boolean;
};

export type Policy =
  | BusinessPolicy
  | { kind: 'self'; userField: string; adminFields?: string[]; userCreates?: boolean }
  | { kind: 'admin' }
  | { kind: 'custom' };

const biz = (p: Omit<BusinessPolicy, 'kind' | 'paths'> & { paths?: string[][] } = {}): BusinessPolicy => ({
  kind: 'business',
  paths: [[]],
  ...p,
});
const via = (...path: string[]) => [path];

export const POLICIES: Record<string, Policy> = {
  // ---- served by their own routes
  user: { kind: 'custom' },
  business: { kind: 'custom' },
  businessRole: { kind: 'custom' },
  businessInvitation: { kind: 'custom' },

  // ---- platform data (public parts are separate routes: /plans/public, POST /contact-messages)
  plan: { kind: 'admin' },
  contactMessage: { kind: 'admin' },
  webhookEvent: { kind: 'admin' },
  notificationCampaign: { kind: 'admin' },
  notificationRecipient: { kind: 'admin' },
  notificationTemplate: { kind: 'admin' },

  // ---- personal
  notification: { kind: 'self', userField: 'userId', adminFields: ['userId', 'title', 'message', 'type', 'actionUrl', 'metadata'] },

  // ---- business core
  businessMembership: biz({ module: 'team', read: ALL_ROLES, write: ADMINS, remove: ADMINS, systemFields: ['userId', 'businessId'], audited: true }),
  subscription: biz({ module: 'settings', read: ALL_ROLES, write: OWNER, remove: [], adminFields: ['status', 'startDate', 'endDate', 'trialEndsAt', 'nextBillingAt', 'externalSubscriptionId'] }),
  subscriptionBillingRecord: biz({ module: 'settings', read: ADMINS, readOnly: true }),
  auditLog: biz({ module: 'settings', read: ADMINS, readOnly: true }),
  fileAsset: biz({ module: 'files', adminFields: ['bucket', 'storagePath', 'isPublic'], systemFields: ['size', 'mimeType', 'version', 'previousVersionId'] }),
  integrationConnection: biz({ module: 'settings', read: ADMINS, write: ADMINS, remove: ADMINS, hiddenFields: ['credentials'], systemFields: ['credentials', 'status', 'connectedAt', 'lastError'], audited: true }),

  // ---- CRM & agency work
  cRMCustomer: biz({ module: 'crm' }),
  lead: biz({ module: 'crm', systemFields: ['convertedAt'], workflowValues: { status: ['WON'] } }),
  pipeline: biz({ module: 'crm', write: MANAGERS }),
  pipelineStage: biz({ module: 'crm', paths: via('pipeline'), write: MANAGERS }),
  deal: biz({ module: 'crm', systemFields: ['status', 'closedAt'], createOnlyFields: ['stageId', 'pipelineId'] }),
  dealStageChange: biz({ module: 'crm', paths: via('deal'), readOnly: true }),
  crmTask: biz({ module: 'crm', systemFields: ['completedAt', 'remindedAt'] }),
  clientOnboarding: biz({ module: 'crm' }),
  clientOnboardingTask: biz({ module: 'crm', paths: via('onboarding') }),
  servicePackage: biz({ module: 'crm', write: MANAGERS }),
  clientSubscription: biz({
    module: 'crm',
    write: MANAGERS,
    systemFields: ['renewalCount', 'lastRenewedAt', 'cancelledAt', 'remindedAt'],
    createOnlyFields: ['status', 'packageId', 'customerId'],
  }),
  clientSubscriptionEvent: biz({ module: 'crm', paths: via('subscription'), readOnly: true }),
  clientCommunication: biz({ module: 'crm' }),

  // ---- creative production
  creativeRequest: biz({ module: 'creative' }),
  creativeProject: biz({ module: 'creative', systemFields: ['revisionCount', 'completedAt'] }),
  creativeTask: biz({ module: 'creative', paths: via('project') }),
  projectMember: biz({ module: 'creative', paths: via('project'), write: MANAGERS }),
  projectComment: biz({ module: 'creative', paths: via('project'), systemFields: ['authorName'] }),
  creativeReview: biz({ module: 'creative', paths: [['project'], ['request'], ['deliverable']], readOnly: true }),
  creativeDeliverable: biz({
    module: 'creative',
    systemFields: ['isFinal', 'reviewTokenHash', 'reviewDeadline', 'submittedAt', 'deliveredAt'],
    workflowValues: { status: ['IN_REVIEW', 'APPROVED', 'DELIVERED', 'REVISION_REQUESTED'] },
    hiddenFields: ['reviewTokenHash'],
  }),

  // ---- marketing & WhatsApp
  marketingContact: biz({
    module: 'marketing',
    systemFields: ['whatsappConsent', 'smsConsent', 'emailConsent', 'optedOutAt', 'whatsappOptInAt', 'lastInboundAt'],
  }),
  contactSegment: biz({ module: 'marketing' }),
  contactSegmentMember: biz({ module: 'marketing', paths: via('segment') }),
  contactConsentEvent: biz({ module: 'marketing', paths: via('contact'), readOnly: true }),
  campaign: biz({
    module: 'marketing',
    write: MANAGERS,
    systemFields: ['status', 'startedAt', 'completedAt', 'totalRecipients', 'sentCount', 'deliveredCount', 'readCount', 'failedCount', 'replyCount', 'clickCount', 'skippedCount', 'totalCost'],
  }),
  campaignRecipient: biz({ module: 'marketing', paths: via('campaign'), readOnly: true }),
  whatsAppAccount: biz({ module: 'settings', read: ALL_ROLES, write: ADMINS, remove: ADMINS, adminFields: ['status', 'qualityRating'] }),
  messageTemplate: biz({ module: 'marketing', write: MANAGERS, adminFields: ['status', 'providerTemplateId', 'rejectionReason'] }),
  automationRule: biz({ module: 'marketing', write: MANAGERS, systemFields: ['lastRunAt', 'runCount'] }),
  automationExecution: biz({ module: 'marketing', readOnly: true }),
  autoReply: biz({ module: 'marketing', write: MANAGERS }),
  chatbotFlow: biz({ module: 'marketing', write: MANAGERS }),
  messageLog: biz({ module: 'marketing', readOnly: true }),

  // ---- stores & orders
  store: biz({ module: 'store', write: MANAGERS, remove: OWNER, adminValues: { status: ['SUSPENDED'] } }),
  storeDomain: biz({
    module: 'settings',
    paths: via('store'),
    write: ADMINS,
    remove: ADMINS,
    adminFields: ['isVerified', 'verifiedAt'],
    systemFields: ['status', 'verificationToken', 'lastCheckedAt', 'lastError'],
  }),
  productCategory: biz({ module: 'store', paths: via('store') }),
  product: biz({ module: 'store', paths: via('store'), createOnlyFields: ['stock'] }),
  productVariant: biz({ module: 'store', paths: via('product', 'store'), createOnlyFields: ['stock'] }),
  inventoryMovement: biz({ module: 'store', paths: via('store'), readOnly: true }),
  storeCustomer: biz({ module: 'store', paths: via('store'), adminFields: ['userId'] }),
  storeOrder: biz({
    module: 'store',
    paths: via('store'),
    systemFields: ['status', 'paymentStatus', 'paidAt', 'deliveredAt', 'cancelledAt', 'whatsappHandoffAt', 'orderNumber', 'subtotal', 'total'],
    remove: ADMINS,
    audited: true,
  }),
  storeOrderItem: biz({ module: 'store', paths: via('order', 'store'), readOnly: true }),
  storeOrderStatusEvent: biz({ module: 'store', paths: via('order', 'store'), readOnly: true }),

  // ---- money (records kept by the business; no in-app payments)
  financeTransaction: biz({
    module: 'finance',
    read: MANAGERS,
    write: MANAGERS,
    remove: ADMINS,
    systemFields: ['status', 'reversalOfId', 'sourceType', 'sourceId', 'nextOccurrenceAt'],
    audited: true,
  }),
  financialCategory: biz({ module: 'finance', read: MANAGERS, write: MANAGERS, remove: ADMINS }),
  invoice: biz({ module: 'finance', read: MANAGERS, write: MANAGERS, remove: ADMINS, systemFields: ['amountPaid'], workflowValues: { status: ['PAID', 'PARTIALLY_PAID'] }, audited: true }),
  invoiceItem: biz({ module: 'finance', paths: via('invoice'), read: MANAGERS, write: MANAGERS, remove: ADMINS }),
  // Payments are created, refunded and voided through /payments workflow endpoints only.
  payment: biz({ module: 'finance', read: MANAGERS, readOnly: true }),
  reportExport: biz({ module: 'reports', read: MANAGERS, readOnly: true }),

  // ---- supplier / reseller marketplace (dropshipping)
  supplierProfile: biz({ module: 'store', write: ADMINS, remove: [], adminFields: ['status', 'verifiedById', 'verifiedAt'] }),
  supplierDocument: biz({ module: 'store', paths: via('supplier'), write: ADMINS, adminFields: ['status', 'reviewedById', 'reviewedAt', 'notes'] }),
  supplierProduct: biz({
    module: 'store',
    paths: via('supplier'),
    publicRead: { status: 'ACTIVE', supplier: { status: 'VERIFIED' } },
  }),
  productImportJob: biz({ module: 'store', paths: via('supplier') }),
  resellerProfile: biz({ module: 'store', write: ADMINS, remove: [], adminFields: ['status'] }),
  resellerProduct: biz({ module: 'store', paths: via('reseller') }),
  productSyncEvent: biz({ module: 'store', paths: [['supplierProduct', 'supplier'], ['resellerProduct', 'reseller']], readOnly: true }),
  promotionLink: biz({ module: 'store', paths: via('reseller'), adminFields: ['clickCount', 'orderCount'] }),
  referralClick: biz({ module: 'store', paths: via('link', 'reseller'), readOnly: true }),
  orderFulfillment: biz({ module: 'store', paths: [['order', 'store'], ['supplier']] }),
  resellerCommission: biz({ module: 'store', paths: [['reseller'], ['order', 'store']], write: MANAGERS, adminFields: ['status'] }),
};

/**
 * Rows of another business that may still be *referenced* (not read or changed) when writing:
 * the marketplace links a reseller's rows to a supplier's catalog, and orders to reseller links.
 * Delegate name -> Prisma where for referencable rows.
 */
export const REFERENCABLE: Record<string, Record<string, unknown>> = {
  plan: { isActive: true },
  supplierProduct: { status: 'ACTIVE', supplier: { status: 'VERIFIED' } },
  supplierProfile: { status: 'VERIFIED' },
  resellerProfile: { status: 'ACTIVE' },
  promotionLink: { isActive: true },
  resellerProduct: { reseller: { status: 'ACTIVE' } },
};

/** Set to the caller on create and never accepted from the request body. */
export const AUTHOR_FIELDS = ['createdById', 'uploadedById', 'changedById', 'recordedById'];

/** Never accepted from a request body. */
export const SYSTEM_FIELDS = ['id', 'createdAt', 'updatedAt'];

/** Validates a custom role's permissions JSON; returns the cleaned value. */
export function parsePermissions(input: unknown): Permissions {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('permissions must be an object');
  const out: Permissions = {};
  for (const [module, actions] of Object.entries(input as Record<string, unknown>)) {
    if (!MODULES.includes(module as Module)) throw new Error(`Unknown module "${module}"`);
    if (!Array.isArray(actions)) throw new Error(`permissions.${module} must be a list`);
    const clean = [...new Set(actions.map(String))];
    for (const a of clean) if (!ACTIONS.includes(a as Action)) throw new Error(`Unknown action "${a}" in ${module}`);
    if (clean.length) out[module as Module] = clean as Action[];
  }
  return out;
}
