// Load environment variables early
import 'dotenv/config';
import { readFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getPool } from '../src/config/pool.js';
import { logger } from '../src/utils/logger.js';
import { dbConfig } from '../src/config/dbConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      run_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
}

async function hasRun(client, name) {
  const r = await client.query('SELECT 1 FROM _migrations WHERE name=$1', [name]);
  return r.rowCount > 0;
}

async function main() {
  logger.info({ dbConfig }, 'Running migrations with DB config');
  const pool = getPool();
  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);
    const dir = path.join(__dirname, 'migrations');
    const files = readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    for (const f of files) {
      if (await hasRun(client, f)) { logger.info({ f }, 'skip migration'); continue; }
      const sql = readFileSync(path.join(dir, f), 'utf-8');
      logger.info({ f }, 'running migration');
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO _migrations(name) VALUES($1)', [f]);
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      }
    }
    logger.info('Migrations complete');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  } finally {
    client.release();
  }
}

main();
