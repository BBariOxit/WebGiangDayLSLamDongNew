import { query } from '../src/config/pool.js';
import { logger } from '../src/utils/logger.js';

async function main() {
  try {
    // Ensure basic roles/providers exist even after migrations
    await query(`INSERT INTO roles(role_code, role_name) VALUES
      ('Admin','Administrator'),('Teacher','Teacher'),('Student','Student')
      ON CONFLICT (role_code) DO NOTHING`);

    await query(`INSERT INTO auth_providers(provider_code, provider_name)
      VALUES ('google','Google')
      ON CONFLICT (provider_code) DO NOTHING`);

    logger.info('Seed complete');
  } catch (e) {
    logger.error(e);
    process.exitCode = 1;
  }
}

main();
