import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import * as User from '../models/User';
import { generateToken } from '../utils/token';
import { ValidationError, UnauthorizedError } from '../utils/errors';
import { config } from '../config';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findByEmail(email);
    if (existing) {
      throw new ValidationError('Validation failed', { email: 'already registered' });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
    const user = await User.create({ name, email, password_hash: passwordHash });

    const token = generateToken({ id: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    // Don't reveal whether email exists — same error for both cases
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email });

    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (err) {
    next(err);
  }
}
