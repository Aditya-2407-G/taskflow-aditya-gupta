import { Router } from 'express';
import { z } from 'zod';
import * as taskController from '../controllers/taskController';
import { authenticate } from '../middlewares/auth';
import { validate, validateQuery } from '../middlewares/validate';

const router = Router();

router.use(authenticate);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional().nullable(),
  due_date: z.string().optional().nullable(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignee_id: z.string().uuid('Invalid assignee ID').optional().nullable(),
  due_date: z.string().optional().nullable(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

const taskFilterSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'done'], {
    errorMap: () => ({ message: 'Must be one of: todo, in_progress, done' }),
  }).optional(),
  assignee: z.string().uuid('Invalid assignee ID').optional(),
  page: z.coerce.number().int().min(1, 'Page must be >= 1').optional(),
  limit: z.coerce.number().int().min(1).max(100, 'Limit must be 1-100').optional(),
}).passthrough();

// Task routes nested under /projects/:id/tasks
router.get('/projects/:id/tasks', validateQuery(taskFilterSchema), taskController.listByProject);
router.post('/projects/:id/tasks', validate(createTaskSchema), taskController.create);

// Task routes at /tasks/:id
router.patch('/tasks/:id', validate(updateTaskSchema), taskController.update);
router.delete('/tasks/:id', taskController.remove);

export default router;
