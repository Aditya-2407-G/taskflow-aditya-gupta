import { Router } from 'express';
import { z } from 'zod';
import * as projectController from '../controllers/projectController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be >= 1').optional(),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be 1-100').optional(),
}).passthrough();

router.get('/', validateQuery(paginationSchema), projectController.list);
router.post('/', validate(createProjectSchema), projectController.create);
router.get('/:id', projectController.getById);
router.patch('/:id', validate(updateProjectSchema), projectController.update);
router.delete('/:id', projectController.remove);
// BONUS: Stats endpoint — provides project-level task summary without fetching all tasks
router.get('/:id/stats', projectController.getStats);

export default router;
