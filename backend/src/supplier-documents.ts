import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import { prisma } from './prisma';
import { authenticate } from './middleware/auth';
import { AppError, asyncHandler } from './middleware/error';
import { createCrudRouter } from './lib/crud';

const router = Router();
const crud = createCrudRouter({ model: 'supplierDocument', searchableFields: ['type','status','notes'] });

// List
router.get('/', authenticate, asyncHandler(crud.list));
// Count
router.get('/count', authenticate, asyncHandler(crud.count));
// Get one
router.get('/:id', authenticate, param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.getOne(req, res, next);
}));
// Create
router.post('/', authenticate, asyncHandler(crud.create));
// Update
router.put('/:id', authenticate, param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.update(req, res, next);
}));
// Delete
router.delete('/:id', authenticate, param('id').notEmpty(), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, statusCode: 400, errors: errors.array() });
  return crud.remove(req, res, next);
}));

export default router;
