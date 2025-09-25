import pkg from 'pg';
import { dbConfig } from './dbConfig.js';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;
let pool;

export function getPool() {
  if (!pool) {
    pool = new Pool(dbConfig);
    pool.on('error', (err) => logger.error({ err }, 'PostgreSQL pool error'));
    logger.info('PostgreSQL pool initialized');
  }
  return pool;
}

export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}
