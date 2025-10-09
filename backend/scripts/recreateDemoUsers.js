import bcrypt from 'bcryptjs';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost',
  port: 55432,
  user: 'admin',
  password: 'admin123',
  database: 'webgiangday_db'
});

const DEMO_PASSWORD = 'demo123';

const users = [
  { email: 'admin@lamdong.edu.vn', full_name: 'Quản trị Hệ thống', role_code: 'Admin', status: 'Active' },
  { email: 'teacher@lamdong.edu.vn', full_name: 'GV. Trần Thị Giáo', role_code: 'Teacher', status: 'Pending' },
  { email: 'student@lamdong.edu.vn', full_name: 'HS. Nguyễn Văn Học', role_code: 'Student', status: 'Active' }
];

async function ensureRoles() {
  const roleCodes = ['Admin','Teacher','Student'];
  for (const code of roleCodes) {
    await pool.query(`INSERT INTO roles (role_code, role_name) VALUES ($1,$2) ON CONFLICT (role_code) DO NOTHING`, [code, code]);
  }
}

async function recreate() {
  try {
    console.log('Recreating demo users...');
    await ensureRoles();
    const hash = await bcrypt.hash(DEMO_PASSWORD, 10);

    // Delete refresh tokens first (FK) then users
    const emails = users.map(u=>u.email);
    await pool.query(`DELETE FROM refresh_tokens WHERE user_id IN (SELECT user_id FROM users WHERE email = ANY($1))`, [emails]);
    await pool.query(`DELETE FROM users WHERE email = ANY($1)`, [emails]);

    for (const u of users) {
      const role = await pool.query('SELECT role_id FROM roles WHERE role_code=$1', [u.role_code]);
      const roleId = role.rows[0]?.role_id;
      if (!roleId) throw new Error('Missing role ' + u.role_code);
      const inserted = await pool.query(`
        INSERT INTO users (email, password_hash, full_name, role_id, status, is_email_verified)
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING user_id, email, full_name, role_id, status
      `, [u.email, hash, u.full_name, roleId, u.status, true]);
      console.log('Inserted', inserted.rows[0]);
    }

    console.log('\nAll demo users recreated with password:', DEMO_PASSWORD);
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

recreate();
