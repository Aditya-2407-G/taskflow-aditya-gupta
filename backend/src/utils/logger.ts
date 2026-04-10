import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export function createLogger(name: string) {
  return pino({
    name,
    level: process.env.LOG_LEVEL || 'info',
    ...(isDev && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'SYS:standard' },
      },
    }),
  });
}

export const logger = createLogger('taskflow');
