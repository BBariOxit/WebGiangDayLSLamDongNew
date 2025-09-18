import sql from 'mssql';
import { dbConfig } from './dbConfig.js';
import { logger } from '../utils/logger.js';

let poolPromise;

export function getPool() {
  if (!poolPromise) {
    poolPromise = sql.connect(dbConfig).then(pool => {
      logger.info('Connected to SQL Server');
      return pool;
    }).catch(err => {
      logger.error({ err }, 'SQL Server connection error');
      throw err;
    });
  }
  return poolPromise;
}

export { sql };
