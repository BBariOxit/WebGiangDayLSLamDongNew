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

async function resetPasswords() {
  try {
    // Hash password 'demo123'
    const hash = await bcrypt.hash('demo123', 10);
    console.log('Generated hash:', hash);

    // Update all demo accounts
    const emails = [
      'admin@lamdong.edu.vn',
      'teacher@lamdong.edu.vn',
      'student@lamdong.edu.vn'
    ];

    for (const email of emails) {
      const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2',
        [hash, email]
      );
      console.log(`✅ Updated password for ${email}`);
    }

    console.log('\n✅ All demo passwords have been reset to: demo123');
    
    // Verify
    const verify = await pool.query(
      `SELECT email, LEFT(password_hash, 20) as hash_preview 
       FROM users 
       WHERE email IN ('admin@lamdong.edu.vn', 'teacher@lamdong.edu.vn', 'student@lamdong.edu.vn')`
    );
    
    console.log('\nVerification:');
    console.table(verify.rows);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

resetPasswords();
