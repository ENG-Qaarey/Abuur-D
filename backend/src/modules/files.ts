import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';
import { authenticate } from '../middleware/auth';
import { AppError, asyncHandler } from '../middleware/error';
import { ok, Input, userId, pageOf, pageMeta } from '../lib/http';
import { findFor, forBusiness, assertInBusiness } from '../lib/guard';
import { audit } from '../lib/audit';
import { accessOf, accessWhere } from '../access/scope';
import { ALLOWED_TYPES, contentMatches, getObject, MAX_UPLOAD_BYTES, putObject, removeObject, signedFileToken, verifyFileToken } from '../lib/storage';
import { rateLimit } from '../middleware/rate-limit';

/**
 * Media library: private uploads (type + size + content checked), version history, metadata,
 * search, access-checked downloads and short-lived signed links for client deliveries.
 */
const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } });

const safeName = (name: string) =>
  path.basename(name).normalize('NFKD').replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_').slice(-120) || 'file';

/** Public: download through a signed link (client deliveries). */
router.get('/files/shared/:token', rateLimit({ windowMs: 60_000, max: 60 }), asyncHandler(async (req, res) => {
  const fileId = verifyFileToken(String(req.params.token));
  if (!fileId) throw new AppError('This link is invalid or has expired', 404);
  const file = await prisma.fileAsset.findUnique({ where: { id: fileId } });
  if (!file) throw new AppError('File not found', 404);
  const body = await getObject(file.bucket, file.storagePath);
  res.setHeader('content-type', file.mimeType);
  res.setHeader('content-disposition', `attachment; filename="${safeName(file.originalName)}"`);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('cache-control', 'private, no-store');
  return res.send(body);
}));

router.use('/files', authenticate);

/** multipart/form-data: file + businessId [+ projectId, customerId, folder, description, previousVersionId] */
router.post('/files/upload', rateLimit({ windowMs: 60_000, max: 60 }), (req, res, next) => {
  upload.single('file')(req, res, (err: unknown) => {
    if (err) {
      const code = (err as { code?: string }).code;
      return next(new AppError(code === 'LIMIT_FILE_SIZE' ? `File is larger than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` : `Upload failed: ${(err as Error).message}`, 400));
    }
    next();
  });
}, asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new AppError('file is required (multipart field "file")', 400);
  const i = Input.of(req);
  const { businessId } = await forBusiness(req, i.raw('businessId'), 'fileAsset', 'create');
  const category = ALLOWED_TYPES[file.mimetype];
  if (!category) throw new AppError(`File type ${file.mimetype} is not allowed`, 400);
  if (!contentMatches(file.mimetype, file.buffer)) throw new AppError('File content does not match its type', 400);
  const projectId = i.id('projectId');
  const customerId = i.id('customerId');
  const previousVersionId = i.id('previousVersionId');
  await assertInBusiness('creativeProject', projectId, businessId, 'projectId');
  await assertInBusiness('cRMCustomer', customerId, businessId, 'customerId');
  let version = 1;
  if (previousVersionId) {
    const prev = await prisma.fileAsset.findFirst({ where: { id: previousVersionId, businessId }, include: { nextVersion: { select: { id: true } } } });
    if (!prev) throw new AppError('previousVersionId was not found in this business', 404);
    if (prev.nextVersion) throw new AppError('A newer version of this file already exists; upload against the latest version', 409);
    version = prev.version + 1;
  }
  const storagePath = `${businessId}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}-${safeName(file.originalname)}`;
  const { bucket } = await putObject(storagePath, file.buffer, file.mimetype);
  try {
    const asset = await prisma.fileAsset.create({
      data: {
        businessId,
        uploadedById: userId(req),
        name: i.str('name', { max: 200 }) ?? file.originalname.slice(0, 200),
        originalName: file.originalname.slice(0, 300),
        mimeType: file.mimetype,
        category,
        size: BigInt(file.size),
        storagePath,
        bucket,
        isPublic: false,
        projectId,
        customerId,
        folder: i.str('folder', { max: 100 }),
        description: i.str('description', { max: 1000 }),
        version,
        previousVersionId,
        metadata: { sha256: crypto.createHash('sha256').update(file.buffer).digest('hex') },
      },
    });
    return ok(res, serialize(asset), 201);
  } catch (e) {
    await removeObject(bucket, storagePath).catch(() => undefined);
    throw e;
  }
}));

const serialize = (f: any) => ({ ...f, size: Number(f.size) });

/** Library listing with filters (q, projectId, customerId, category, folder, uploadedById). */
router.get('/files', asyncHandler(async (req, res) => {
  const access = await accessOf(req);
  const { page, limit, skip } = pageOf(req);
  const q = req.query;
  const where: Prisma.FileAssetWhereInput = { AND: [accessWhere('fileAsset', access, 'read') ?? {}] };
  const and = where.AND as Prisma.FileAssetWhereInput[];
  for (const k of ['businessId', 'projectId', 'customerId', 'uploadedById', 'folder'] as const) if (typeof q[k] === 'string' && q[k]) and.push({ [k]: q[k] });
  if (typeof q.category === 'string' && ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'].includes(q.category)) and.push({ category: q.category as any });
  if (typeof q.q === 'string' && q.q.trim()) and.push({ OR: [{ name: { contains: q.q.trim(), mode: 'insensitive' } }, { description: { contains: q.q.trim(), mode: 'insensitive' } }, { originalName: { contains: q.q.trim(), mode: 'insensitive' } }] });
  if (q.latestOnly !== 'false') and.push({ nextVersion: { is: null } });
  const [items, total] = await Promise.all([
    prisma.fileAsset.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit, include: { uploadedBy: { select: { firstName: true, lastName: true } } } }),
    prisma.fileAsset.count({ where }),
  ]);
  return ok(res, items.map(serialize), 200, { meta: pageMeta(page, limit, total) });
}));

router.get('/files/:id', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'fileAsset', req.params.id);
  return ok(res, serialize(row));
}));

/** All versions of a file, oldest first. */
router.get('/files/:id/versions', asyncHandler(async (req, res) => {
  const { row } = await findFor(req, 'fileAsset', req.params.id);
  let first: any = row;
  while (first.previousVersionId) first = await prisma.fileAsset.findUnique({ where: { id: first.previousVersionId } });
  const chain = [first];
  let cur = first;
  while (cur) {
    cur = await prisma.fileAsset.findUnique({ where: { previousVersionId: cur.id } });
    if (cur) chain.push(cur);
  }
  return ok(res, chain.map(serialize));
}));

router.get('/files/:id/download', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'fileAsset', req.params.id);
  const body = await getObject(row.bucket, row.storagePath);
  await audit(req, { action: 'file.download', entityType: 'FileAsset', entityId: row.id, businessId });
  res.setHeader('content-type', row.mimeType);
  res.setHeader('content-disposition', `${req.query.inline === '1' && row.category === 'IMAGE' ? 'inline' : 'attachment'}; filename="${safeName(row.originalName)}"`);
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('cache-control', 'private, no-store');
  return res.send(body);
}));

/** Signed link (default 7 days) for sharing a file with someone outside ABUUR. */
router.post('/files/:id/link', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'fileAsset', req.params.id, 'write');
  const days = Input.of(req).int('days', { min: 1, max: 30 }) ?? 7;
  const token = signedFileToken(row.id, days * 86_400);
  await audit(req, { action: 'file.share_link', entityType: 'FileAsset', entityId: row.id, businessId, metadata: { days } });
  return ok(res, { path: `/files/shared/${token}`, expiresAt: new Date(Date.now() + days * 86_400_000) });
}));

router.delete('/files/:id', asyncHandler(async (req, res) => {
  const { row, businessId } = await findFor(req, 'fileAsset', req.params.id, 'remove');
  const usedBy = await prisma.creativeDeliverable.count({ where: { fileId: row.id, status: { in: ['APPROVED', 'DELIVERED'] } } });
  if (usedBy) throw new AppError('This file is an approved or delivered deliverable and cannot be deleted', 409);
  await prisma.fileAsset.delete({ where: { id: row.id } });
  await removeObject(row.bucket, row.storagePath).catch((e) => console.error('[files] could not remove object', e));
  await audit(req, { action: 'file.delete', entityType: 'FileAsset', entityId: row.id, businessId, metadata: { name: row.name } });
  return ok(res, { deleted: true });
}));

export default router;
