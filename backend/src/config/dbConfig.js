import 'dotenv/config';

// PostgreSQL config
export const dbConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432', 10),
  database: process.env.PG_DATABASE || 'historyedu',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || undefined,
  max: 10,
  idleTimeoutMillis: 30000
};
