import bcrypt from 'bcryptjs';

const rounds = parseInt(process.env.PASSWORD_SALT_ROUNDS || '10', 10);

export async function hashPassword(plain) {
  return bcrypt.hash(plain, rounds);
}

export async function comparePassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}
