import 'dotenv/config';

// PostgreSQL config - updated to use DB_* env vars
export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '55432', 10),
  database: process.env.DB_NAME || 'webgiangday_db',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
};
