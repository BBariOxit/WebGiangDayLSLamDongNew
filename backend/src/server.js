import app from './app.js';
import { logger } from './utils/logger.js';

function validateEnv() {
  const required = ['DB_HOST','DB_PORT','DB_USER','DB_NAME','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    logger.warn({ missing }, 'Missing required environment variables');
  }
}

validateEnv();

const port = process.env.PORT || 4000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
