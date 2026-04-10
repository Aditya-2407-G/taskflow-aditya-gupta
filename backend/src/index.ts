import { config } from './config';
import { createApp } from './app';
import db from './db/db';
import { logger } from './utils/logger';

async function main() {
  // Run migrations on startup
  logger.info('Running database migrations...');
  await db.migrate.latest();
  logger.info('Migrations complete');

  // Run seeds
  logger.info('Running seed data...');
  await db.seed.run();
  logger.info('Seed data complete');

  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(`Server started on port ${config.port} (${config.nodeEnv})`);
  });

  // Graceful shutdown on SIGTERM/SIGINT
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await db.destroy();
      logger.info('Database connection pool destroyed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
