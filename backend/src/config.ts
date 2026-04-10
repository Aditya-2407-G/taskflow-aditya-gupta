import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
    process.exit(1);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv === 'development';

const jwtSecret = requireEnv('JWT_SECRET');
if (jwtSecret.length < 32) {
  console.error('FATAL: JWT_SECRET must be at least 32 characters');
  process.exit(1);
}
if (jwtSecret === 'change-me-to-a-long-random-string-at-least-32-chars' && !isDev) {
  console.error('FATAL: JWT_SECRET must be changed from the default value in production');
  process.exit(1);
}

const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
if (isNaN(bcryptRounds) || bcryptRounds < 12) {
  console.error('FATAL: BCRYPT_ROUNDS must be an integer >= 12');
  process.exit(1);
}

const databaseUrl = requireEnv('DATABASE_URL');
if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
  console.error('FATAL: DATABASE_URL must be a valid PostgreSQL connection string');
  process.exit(1);
}

export const config = {
  nodeEnv,
  isDev,
  port: parseInt(process.env.API_PORT || '3000', 10),
  databaseUrl,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  bcryptRounds,
  corsOrigin: process.env.CORS_ORIGIN || (isDev ? '*' : 'http://localhost:8080'),
  logLevel: process.env.LOG_LEVEL || 'info',
};
