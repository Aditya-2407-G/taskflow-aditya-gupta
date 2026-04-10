import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { authRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);

export default router;
