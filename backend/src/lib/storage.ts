import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';
import { getSupabaseAdmin } from './supabase';

/**
 * Private file storage. Files are never public: every download goes through the API after an
 * access check (or a short-lived signed link for client deliveries).
 *
 * STORAGE_DRIVER=supabase (default when Supabase is configured): private bucket STORAGE_BUCKET
 *   (default "abuur-private"), created on first use.
 * STORAGE_DRIVER=local: files under STORAGE_LOCAL_DIR (default ./storage) — development/tests.
 */
const driver = () => process.env.STORAGE_DRIVER ?? (config.supabaseUrl && config.supabaseSecretKey ? 'supabase' : 'local');
export const bucketName = () => process.env.STORAGE_BUCKET ?? 'abuur-private';
const localDir = () => path.resolve(process.env.STORAGE_LOCAL_DIR ?? './storage');

export const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_MB ?? 25) * 1024 * 1024;

/** Allowed upload types (by MIME) → FileCategory. */
export const ALLOWED_TYPES: Record<string, 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'> = {
  'image/jpeg': 'IMAGE',
  'image/png': 'IMAGE',
  'image/webp': 'IMAGE',
  'image/gif': 'IMAGE',
  'video/mp4': 'VIDEO',
  'video/quicktime': 'VIDEO',
  'video/webm': 'VIDEO',
  'audio/mpeg': 'AUDIO',
  'audio/wav': 'AUDIO',
  'audio/ogg': 'AUDIO',
  'application/pdf': 'DOCUMENT',
  'text/csv': 'DOCUMENT',
  'text/plain': 'DOCUMENT',
  'application/zip': 'DOCUMENT',
  'application/msword': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCUMENT',
  'application/vnd.ms-excel': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'DOCUMENT',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'DOCUMENT',
  'application/postscript': 'DOCUMENT',
  'image/vnd.adobe.photoshop': 'IMAGE',
};

/** Checks magic bytes for common types so a renamed .exe can't pass as an image/PDF. */
export function contentMatches(mime: string, buf: Buffer): boolean {
  const starts = (...bytes: number[]) => bytes.every((b, i) => buf[i] === b);
  switch (mime) {
    case 'image/jpeg':
      return starts(0xff, 0xd8, 0xff);
    case 'image/png':
      return starts(0x89, 0x50, 0x4e, 0x47);
    case 'image/gif':
      return buf.subarray(0, 3).toString() === 'GIF';
    case 'image/webp':
      return buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
    case 'application/pdf':
      return buf.subarray(0, 4).toString() === '%PDF';
    case 'application/zip':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      return starts(0x50, 0x4b);
    default:
      // Executables are never accepted, whatever the declared type.
      return !(starts(0x4d, 0x5a) || starts(0x7f, 0x45, 0x4c, 0x46));
  }
}

let bucketReady = false;
async function ensureBucket() {
  if (bucketReady) return;
  const sb = getSupabaseAdmin();
  const { data } = await sb.storage.getBucket(bucketName());
  if (!data) {
    const { error } = await sb.storage.createBucket(bucketName(), { public: false, fileSizeLimit: MAX_UPLOAD_BYTES });
    if (error && !/already exists/i.test(error.message)) throw new Error(`Storage bucket: ${error.message}`);
  } else if (data.public) {
    throw new Error(`Storage bucket ${bucketName()} is public; it must be private`);
  }
  bucketReady = true;
}

export async function putObject(storagePath: string, body: Buffer, contentType: string): Promise<{ bucket: string }> {
  if (driver() === 'local') {
    const full = path.join(localDir(), storagePath);
    if (!full.startsWith(localDir())) throw new Error('Invalid storage path');
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, body);
    return { bucket: 'local' };
  }
  await ensureBucket();
  const { error } = await getSupabaseAdmin().storage.from(bucketName()).upload(storagePath, body, { contentType, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return { bucket: bucketName() };
}

export async function getObject(bucket: string, storagePath: string): Promise<Buffer> {
  if (bucket === 'local') {
    const full = path.join(localDir(), storagePath);
    if (!full.startsWith(localDir())) throw new Error('Invalid storage path');
    return fs.readFile(full);
  }
  const { data, error } = await getSupabaseAdmin().storage.from(bucket).download(storagePath);
  if (error || !data) throw new Error(`Download failed: ${error?.message ?? 'not found'}`);
  return Buffer.from(await data.arrayBuffer());
}

export async function removeObject(bucket: string, storagePath: string): Promise<void> {
  if (bucket === 'local') {
    await fs.rm(path.join(localDir(), storagePath), { force: true });
    return;
  }
  await getSupabaseAdmin().storage.from(bucket).remove([storagePath]);
}

// ---- signed download links (client deliveries): /api/files/shared/<fileId>.<exp>.<sig>

const sign = (payload: string) => crypto.createHmac('sha256', `abuur-files:${config.jwtSecret}`).update(payload).digest('base64url');

export function signedFileToken(fileId: string, ttlSeconds = 7 * 86_400): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${fileId}.${exp}.${sign(`${fileId}.${exp}`)}`;
}

export function verifyFileToken(token: string): string | null {
  const [fileId, exp, sig] = token.split('.');
  if (!fileId || !exp || !sig) return null;
  if (Number(exp) < Date.now() / 1000) return null;
  const expected = sign(`${fileId}.${exp}`);
  if (expected.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  return fileId;
}
