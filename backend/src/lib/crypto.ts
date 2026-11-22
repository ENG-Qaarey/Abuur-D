import crypto from 'crypto';
import { config } from '../config';

/**
 * Integration secrets (API tokens) are stored encrypted with AES-256-GCM.
 * Key: CREDENTIALS_KEY (64 hex chars). If missing, a key derived from JWT_SECRET is used and a
 * warning is printed once — set CREDENTIALS_KEY in production.
 */
let warned = false;
function key(): Buffer {
  const hex = process.env.CREDENTIALS_KEY ?? '';
  if (/^[0-9a-f]{64}$/i.test(hex)) return Buffer.from(hex, 'hex');
  if (!warned) {
    console.warn('[crypto] CREDENTIALS_KEY is not set; deriving the credentials key from JWT_SECRET');
    warned = true;
  }
  return crypto.createHash('sha256').update(`abuur-credentials:${config.jwtSecret}`).digest();
}

export function encryptJson(value: unknown): { v: 1; iv: string; tag: string; data: string } {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const data = Buffer.concat([cipher.update(JSON.stringify(value), 'utf8'), cipher.final()]);
  return { v: 1, iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: data.toString('base64') };
}

export function decryptJson<T = Record<string, string>>(blob: unknown): T | null {
  const b = blob as { v?: number; iv?: string; tag?: string; data?: string } | null;
  if (!b || b.v !== 1 || !b.iv || !b.tag || !b.data) return null;
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), Buffer.from(b.iv, 'base64'));
    decipher.setAuthTag(Buffer.from(b.tag, 'base64'));
    const out = Buffer.concat([decipher.update(Buffer.from(b.data, 'base64')), decipher.final()]);
    return JSON.parse(out.toString('utf8')) as T;
  } catch {
    return null;
  }
}

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
export const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('base64url');

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}
