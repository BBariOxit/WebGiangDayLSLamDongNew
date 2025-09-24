// Script: setDevPasswords.js
// Hash password '123456' for sample users defined in seed.sql
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getPool, sql } from '../src/config/pool.js';

async function run() {
  const users = [
    'admin@history.local',
    'teacher.local@test.com',
    'student.local@test.com'
  ];
  const hash = await bcrypt.hash('123456', parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10));
  const buf = Buffer.from(hash);
  const pool = await getPool();
  for (const email of users) {
    await pool.request()
      .input('Email', sql.VarChar(255), email)
      .input('PasswordHash', sql.VarBinary(256), buf)
      .query('UPDATE Users SET PasswordHash=@PasswordHash WHERE Email=@Email');
    console.log('Updated password for', email);
  }
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });