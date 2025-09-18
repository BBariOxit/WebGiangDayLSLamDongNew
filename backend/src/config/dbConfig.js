import 'dotenv/config';

export const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'HistoryEduDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 }
};
