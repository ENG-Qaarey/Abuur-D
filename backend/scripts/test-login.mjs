// End-to-end login check against the running backend.
//
// Usage (backend running with `npm run start:dev`):
//   node scripts/test-login.mjs              email + password login (e.g. the seeded admin
//                                            abuur@gmail.com from prisma/seed.ts)
//   node scripts/test-login.mjs --supabase   Supabase Auth sign-in -> token exchange
//
// Then it calls /auth/me (and /users for a platform admin) with the ABUUR token.
// The password is read with echo off and only sent to your own backend
// (or, with --supabase, to your own Supabase project).
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^[A-Z_]+=/.test(l))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')];
    }),
);

const USE_SUPABASE = process.argv.includes('--supabase');
const SUPABASE_URL = env.SUPABASE_URL;
const PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? env.SUPABASE_PUBLISHABLE_KEY;
const API = process.env.API_URL ?? `http://localhost:${env.PORT || 3000}/api`;

// One readline for the whole run, so piped input (two lines) is read correctly.
const lines = [];
const waiting = [];
const isTTY = Boolean(process.stdin.isTTY);
const rlAll = isTTY ? null : createInterface({ input: process.stdin });
rlAll?.on('line', (l) => (waiting.length ? waiting.shift()(l.trim()) : lines.push(l.trim())));

function ask(question, { hidden = false } = {}) {
  if (!isTTY) {
    process.stdout.write(question + (hidden ? '(hidden)\n' : '\n'));
    return new Promise((resolve) => (lines.length ? resolve(lines.shift()) : waiting.push(resolve)));
  }
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

const step = (n, text) => console.log(`\n${n}. ${text}`);

function fail() {
  process.exitCode = 1;
  return null;
}

/** POST to the backend; null (after printing why) if it is down or answers an error. */
async function callApi(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((e) => {
    console.error(`   FAILED: backend not reachable at ${API} (${e.cause?.code ?? e.message}). Is "npm run start:dev" running?`);
    return null;
  });
  if (!res) return fail();
  const json = await res.json();
  if (!res.ok) {
    console.error(`   FAILED (${res.status}): ${json.message ?? JSON.stringify(json)}`);
    if (res.status === 401 && path === '/auth/login') {
      console.error('   Tip: run "npx prisma db seed" to (re)create the admin, then try again.');
    }
    if (res.status === 429) console.error('   Too many attempts: wait one minute.');
    return fail();
  }
  return json;
}

async function loginWithPassword(email, password) {
  step(1, `Logging in at ${API}/auth/login…`);
  return callApi('/auth/login', { email, password });
}

async function loginWithSupabase(email, password) {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
    console.error('Need SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env');
    return fail();
  }
  step(1, 'Signing in to Supabase Auth…');
  const sb = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const sbBody = await sb.json();
  if (!sb.ok) {
    console.error(`   FAILED (${sb.status}): ${sbBody.msg ?? sbBody.error_description ?? JSON.stringify(sbBody)}`);
    console.error('   Tip: this checks Supabase Auth users only. For the seeded admin, run without --supabase.');
    return fail();
  }
  console.log(`   OK, Supabase user ${sbBody.user.id} (${sbBody.user.email})`);

  step(2, `Exchanging the Supabase token at ${API}/auth/verify-supabase…`);
  return callApi('/auth/verify-supabase', { accessToken: sbBody.access_token });
}

async function main() {
  console.log(USE_SUPABASE ? 'Mode: Supabase Auth' : 'Mode: email + password (local account)');
  const email = await ask('Email: ');
  const password = await ask('Password (hidden): ', { hidden: true });
  rlAll?.close();

  const session = USE_SUPABASE ? await loginWithSupabase(email, password) : await loginWithPassword(email, password);
  if (!session) return;
  console.log(`   OK, ABUUR user ${session.user.email}, role ${session.user.platformRole}, token valid ${session.expiresIn}`);

  const auth = { headers: { Authorization: `Bearer ${session.accessToken}` } };

  step(USE_SUPABASE ? 3 : 2, 'Calling /auth/me with the ABUUR token…');
  const me = await fetch(`${API}/auth/me`, auth);
  const meBody = await me.json();
  if (!me.ok) {
    console.error(`   FAILED (${me.status}): ${JSON.stringify(meBody)}`);
    return fail();
  }
  console.log(`   OK, ${meBody.firstName ?? ''} ${meBody.lastName ?? ''} <${meBody.email}>, ${meBody.memberships.length} business membership(s)`.replace(/\s+</, ' <'));

  if (session.user.platformRole === 'SUPER_ADMIN') {
    step(USE_SUPABASE ? 4 : 3, 'Checking admin access (GET /users)…');
    const users = await fetch(`${API}/users`, auth);
    if (!users.ok) {
      console.error(`   FAILED (${users.status})`);
      return fail();
    }
    console.log(`   OK, admin can list users (${(await users.json()).length} found)`);
  }

  console.log(`\nLogin works end to end (${USE_SUPABASE ? 'Supabase Auth' : 'email + password'}).`);
}

await main();
