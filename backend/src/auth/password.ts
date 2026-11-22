// Password hashing for local email + password login (accounts created before Supabase Auth).
//
// Uses Node's built-in scrypt. Stored format (same as the original NestJS backend, so existing
// users keep working):
//   scrypt$<N>$<r>$<p>$<salt base64>$<hash base64>
// so the cost parameters can be raised later without breaking old hashes.
// Also verifies the short-lived `<salt hex>:<key hex>` format the first Express version wrote.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer | string, n: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, { N: n, r, p, maxmem: MAX_MEMORY }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, N, R, P);
  return ['scrypt', N, R, P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string | null | undefined): Promise<boolean> {
  const value = stored ?? '';

  // Legacy Express format: hex salt string (used as text) + ':' + hex key.
  const legacy = /^([0-9a-f]+):([0-9a-f]{128})$/.exec(value);
  if (legacy) {
    const actual = await derive(password, legacy[1], N, R, P);
    return timingSafeEqual(actual, Buffer.from(legacy[2], 'hex'));
  }

  const parts = value.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const [, n, r, p, saltB64, hashB64] = parts;
  const expected = Buffer.from(hashB64, 'base64');
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await derive(password, Buffer.from(saltB64, 'base64'), Number(n), Number(r), Number(p));
  return timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;
/**
 * A real hash to verify against when the email is unknown, so a wrong email
 * takes as long as a wrong password (no account enumeration by timing).
 */
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(randomBytes(16).toString('hex'));
  return dummyHash;
}
