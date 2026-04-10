import { Knex } from 'knex';
import path from 'path';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://taskflow:taskflow@localhost:5432/taskflow';

const config: Knex.Config = {
  client: 'pg',
  connection: databaseUrl,
  migrations: {
    directory: path.resolve(__dirname, 'migrations'),
    extension: 'js',        // ← change from 'ts'
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: path.resolve(__dirname, 'seeds'),
    extension: 'js',        // ← change from 'ts'
    loadExtensions: ['.js'],
  },
  pool: { min: 2, max: 10 },
};

export default config;
