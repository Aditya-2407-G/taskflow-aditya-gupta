import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/token';
import { UnauthorizedError } from '../utils/errors';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  req.user = { id: payload.user_id, email: payload.email };
  next();
}
