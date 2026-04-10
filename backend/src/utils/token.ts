import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from './errors';

interface TokenPayload {
  user_id: string;
  email: string;
}

export function generateToken(payload: { id: string; email: string }): string {
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as any };
  return jwt.sign(
    { user_id: payload.id, email: payload.email },
    config.jwtSecret,
    options
  );
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
