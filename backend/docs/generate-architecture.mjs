// Generates docs/architecture.svg — the ABUUR main architecture diagram.
// Run: node docs/generate-architecture.mjs   (then render PNG, see docs/README note in the script footer)
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1600;
const H = 1120;

const C = {
  bg: '#0b1120',
  panel: '#111a2e',
  card: '#16213a',
  line: '#26344f',
  text: '#e2e8f0',
  muted: '#94a3b8',
  dim: '#64748b',
  blue: '#38bdf8',
  violet: '#a78bfa',
  green: '#34d399',
  amber: '#fbbf24',
  teal: '#2dd4bf',
  grey: '#475569',
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const out = [];
const add = (s) => out.push(s);

const text = (x, y, s, { size = 13, fill = C.text, weight = 400, anchor = 'start', spacing = 0 } = {}) =>
  add(
    `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" text-anchor="${anchor}"${
      spacing ? ` letter-spacing="${spacing}"` : ''
    }>${esc(s)}</text>`,
  );

const rect = (x, y, w, h, { fill = C.card, stroke = C.line, rx = 10, dash = false, width = 1.2 } = {}) =>
  add(
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${
      dash ? ' stroke-dasharray="6 5"' : ''
    }/>`,
  );

const arrow = (pts, color, { dash = false, head = true } = {}) =>
  add(
    `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.8"${
      dash ? ' stroke-dasharray="5 4"' : ''
    }${head ? ` marker-end="url(#arrow-${color.slice(1)})"` : ''}/>`,
  );

const sectionLabel = (x, y, s) => text(x, y, s.toUpperCase(), { size: 11.5, fill: C.muted, weight: 600, spacing: 1.4 });

/** Card with a coloured title and muted body lines. */
function card(x, y, w, h, title, lines, color, opts = {}) {
  rect(x, y, w, h, { stroke: color, dash: opts.dash, fill: opts.fill ?? C.card });
  text(x + 14, y + 24, title, { size: 14.5, weight: 600, fill: opts.dash ? C.text : color });
  lines.forEach((l, i) => text(x + 14, y + 44 + i * 17, l, { size: 12.2, fill: C.muted }));
}

/** Rough text width for Segoe UI at the given size. */
const tw = (s, size) => s.length * size * 0.56;

function chips(x, y, maxW, items, color, dashed) {
  let cx = x;
  let cy = y;
  for (const item of items) {
    const w = tw(item, 12) + 20;
    if (cx + w > x + maxW) {
      cx = x;
      cy += 30;
    }
    rect(cx, cy, w, 23, { rx: 11.5, fill: dashed ? 'none' : '#12302a', stroke: color, dash: dashed, width: 1 });
    text(cx + w / 2, cy + 16, item, { size: 12, anchor: 'middle', fill: dashed ? C.muted : C.text });
    cx += w + 8;
  }
}

// ---------- defs & background ----------
add(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif">`);
add('<defs>');
for (const color of [C.blue, C.violet, C.green, C.amber, C.teal, C.muted]) {
  add(
    `<marker id="arrow-${color.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`,
  );
}
add('</defs>');
rect(0, 0, W, H, { fill: C.bg, stroke: C.bg, rx: 0 });

// ---------- title ----------
text(60, 62, 'ABUUR Platform Architecture', { size: 30, weight: 700 });
text(60, 90, 'NestJS API · Prisma · Supabase (Postgres, Auth, Storage) · BullMQ/Redis — state after Phase 1 hardening, Nov 2026', {
  size: 14.5,
  fill: C.muted,
});

// ---------- clients ----------
rect(60, 116, 1120, 128, { fill: C.panel });
sectionLabel(80, 142, 'Clients');
const clients = [
  ['Business dashboard', 'Next.js · Abuur/', false],
  ['Online storefront', 'public store pages', false],
  ['ABUUR admin', 'SUPER_ADMIN users', false],
  ['WhatsApp customers', 'orders & chat', false],
];
clients.forEach(([t, s, planned], i) => {
  const x = 80 + i * 275;
  rect(x, 156, 255, 68, { stroke: C.blue, dash: planned });
  text(x + 127.5, 184, t, { size: 14.5, weight: 600, anchor: 'middle', fill: planned ? C.muted : C.text });
  text(x + 127.5, 205, s, { size: 12.2, anchor: 'middle', fill: C.muted });
});

// ---------- supabase auth ----------
card(1220, 116, 320, 128, 'Supabase Auth', [
  'Sign-up / login (email, phone)',
  'Issues the Supabase session JWT',
  'Public keys: /auth/v1/.well-known/jwks.json',
], C.violet);
arrow([[1180, 176], [1218, 176]], C.violet);
text(1199, 168, '①', { size: 13, fill: C.violet, anchor: 'middle' });

// clients -> API
arrow([[620, 244], [620, 288]], C.blue);
text(634, 262, '② POST /api/auth/verify-supabase  →  app JWT (1h)', { size: 12.5, fill: C.blue });
text(634, 279, '③ every call: Authorization: Bearer <app JWT>  (+ X-Business-Id)', { size: 12.5, fill: C.blue });

// API verifies Supabase token via JWKS
arrow([[1300, 244], [1300, 268], [1150, 268], [1150, 288]], C.violet, { dash: true });
text(1312, 262, 'verify Supabase token (JWKS / HS256 legacy)', { size: 11.5, fill: C.violet });

// ---------- API ----------
rect(60, 290, 1120, 522, { fill: C.panel });
sectionLabel(80, 316, 'NestJS API  ·  /api  ·  REST  ·  Swagger at /api/docs (non-production only)');

sectionLabel(80, 344, 'Request pipeline (every request, in order)');
const steps = [
  ['Helmet · CORS', ['origin allowlist', 'compression'], C.blue],
  ['ThrottlerGuard', ['100 req/min global', 'login: 10/min'], C.blue],
  ['JwtAuthGuard', ['verify HS256 signature', 'iss · aud · exp', 'load user, must be ACTIVE'], C.violet],
  ['BusinessAccessGuard', ['route needs access marker', 'membership + role check', 'no marker → 403'], C.violet],
  ['ValidationPipe', ['class-validator DTOs', 'unknown fields → 400'], C.blue],
  ['Controller → Service', ['scoped by businessId', 'Prisma errors → 404/409'], C.green],
];
steps.forEach(([t, lines, color], i) => {
  const x = 80 + i * 183;
  card(x, 354, 165, 96, t, lines, color);
  if (i < steps.length - 1) arrow([[x + 166, 402], [x + 181, 402]], C.muted);
});

sectionLabel(80, 478, 'Domain modules by roadmap phase');
// kind: 'enforced' (access rules live) | 'blocked' (models exist, API default-deny) | 'planned' (tables not built)
const groups = [
  ['Phase 1 · Core & tenancy', 'access rules enforced', ['Auth', 'Users', 'Businesses', 'Members', 'Audit logs'], 'enforced'],
  ['Phase 2 · Store builder', 'default-deny until scoped', ['Stores', 'Products', 'Variants', 'Categories', 'Inventory', 'Store domains', 'File assets'], 'blocked'],
  ['Phase 3 · Cart & orders', 'default-deny until scoped', ['Store customers', 'Orders', 'Order items', 'Status history', 'Payments'], 'blocked'],
  ['Phase 4 · Admin & billing', 'default-deny until scoped', ['Plans', 'Subscriptions', 'Billing records', 'Invoices', 'Finance'], 'blocked'],
  ['Phase 5 · Dropshipping', 'not built yet', ['Suppliers', 'Supplier products', 'Reseller products', 'Fulfilments'], 'planned'],
  ['Phase 6 · WhatsApp marketing', 'default-deny until scoped', ['Contacts', 'Campaigns', 'Recipients', 'Notifications'], 'blocked'],
  ['CRM · Creative · Integrations', 'default-deny until scoped', ['CRM customers', 'Leads', 'Creative ×4', 'Integrations', 'Webhook events'], 'blocked'],
];
const GW = 258; // 4 columns across the 1080px API area
groups.forEach(([title, sub, items, kind], i) => {
  const x = 80 + (i % 4) * (GW + 16);
  const y = 490 + Math.floor(i / 4) * 160;
  const w = i === groups.length - 1 ? GW * 2 + 16 : GW; // last group fills the row
  const enforced = kind === 'enforced';
  const color = enforced ? C.green : kind === 'planned' ? C.blue : C.grey;
  rect(x, y, w, 146, { stroke: color, dash: !enforced, fill: enforced ? '#10241f' : C.card, width: enforced ? 1.6 : 1.2 });
  text(x + 14, y + 25, title, { size: 14.5, weight: 600, fill: enforced ? C.green : C.text });
  text(x + 14, y + 44, sub, { size: 12, fill: enforced ? C.green : kind === 'planned' ? C.blue : C.dim });
  chips(x + 14, y + 58, w - 28, items, color, !enforced);
});

// ---------- async: Redis / BullMQ ----------
card(1220, 290, 320, 150, 'Redis · BullMQ', [
  'Queues: email · whatsapp · sms',
  'Workers (processors) with retries',
  'Keeps slow sends out of requests',
], C.amber);
arrow([[1180, 365], [1218, 365]], C.amber);
text(1199, 357, 'jobs', { size: 11.5, fill: C.amber, anchor: 'middle' });

arrow([[1240, 440], [1240, 650]], C.amber, { head: false });
const providers = [
  ['Resend', 'transactional email'],
  ['WhatsApp Cloud API', 'messages & order updates'],
  ['SMS provider', 'OTP & notifications'],
];
providers.forEach(([t, s], i) => {
  const y = 462 + i * 70;
  arrow([[1240, y + 28], [1258, y + 28]], C.amber);
  rect(1260, y, 280, 56, { stroke: C.amber });
  text(1276, y + 24, t, { size: 14, weight: 600, fill: C.amber });
  text(1276, y + 43, s, { size: 12.2, fill: C.muted });
});
arrow([[1260, 586], [1182, 586]], C.muted, { dash: true });
text(1260, 690, '↩ inbound webhooks (delivery status, customer', { size: 12, fill: C.muted });
text(1260, 707, '    messages) → /api/webhook-events, deduped', { size: 12, fill: C.muted });

card(1220, 734, 320, 78, 'Sentry · NestJS Observe', ['errors, traces & metrics'], C.muted);
arrow([[1180, 773], [1218, 773]], C.muted, { dash: true });

// ---------- data ----------
arrow([[620, 812], [620, 858]], C.teal);
text(634, 840, 'Prisma ORM (connects as table owner)', { size: 12.5, fill: C.teal });

rect(60, 860, 1480, 156, { fill: C.panel });
sectionLabel(80, 886, 'Data  ·  Supabase');
card(80, 898, 720, 102, 'PostgreSQL · 34 Prisma models', [
  'Every store belongs to a business · tenant data keyed by businessId · memberships carry roles',
  'Row-level security ON for every table, no policies → Supabase Data API (anon key) sees nothing;',
  'the API (table owner) bypasses RLS, so app-level tenant checks are the primary control',
], C.teal);
card(820, 898, 330, 102, 'Supabase Storage', ['File bytes (logos, product images, creatives)', 'Metadata rows in file_assets'], C.teal);
card(1170, 898, 350, 102, 'Prisma migrations', ['20261031 init · 20261105 platform_role', '20261105 enable_rls', '20261106 align_store_mvp'], C.teal);

// ---------- legend ----------
const ly = 1062;
const legend = [
  [C.green, false, 'access rules enforced'],
  [C.grey, true, 'blocked (403) until its phase adds rules'],
  [C.violet, false, 'auth & security'],
  [C.amber, false, 'async jobs & providers'],
  [C.blue, true, 'not built yet'],
];
let lx = 60;
for (const [color, dash, label] of legend) {
  rect(lx, ly - 13, 26, 16, { stroke: color, dash, rx: 4, fill: 'none', width: 1.6 });
  text(lx + 36, ly, label, { size: 12.5, fill: C.muted });
  lx += 36 + tw(label, 12.5) + 34;
}
text(60, ly + 32, 'Orders: NEW → CONFIRMED → PREPARING → READY → DISPATCHED → DELIVERED / CANCELLED; payment agreed on WhatsApp, off-platform. Business roles: OWNER > ADMIN > MANAGER > EMPLOYEE > VIEWER.', {
  size: 12.5,
  fill: C.dim,
});

add('</svg>');

const dir = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, 'architecture.svg'), out.join('\n'));
console.log('wrote docs/architecture.svg');
