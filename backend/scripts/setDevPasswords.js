// Script: setDevPasswords.js (PostgreSQL)
// Hash password '123456' (or PASSWORD_OVERRIDE) for sample users defined in seed.sql
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getPool } from '../src/config/pool.js';

async function run() {
  const users = [
    'admin@history.local',
    'teacher.local@test.com',
    'student.local@test.com'
  ];
  const plain = process.env.PASSWORD_OVERRIDE || '123456';
  const hash = await bcrypt.hash(plain, parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10));
  const pool = getPool();
  for (const email of users) {
    const result = await pool.query('UPDATE users SET password_hash=$1 WHERE email=$2', [hash, email]);
    console.log('Updated password for', email, 'rows:', result.rowCount);
  }
  console.log('Done. Use password:', plain);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });