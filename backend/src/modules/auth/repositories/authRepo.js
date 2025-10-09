import { query } from '../../../config/pool.js';

export async function findUserByEmail(email) {
  const r = await query(`
    SELECT u.*, r.role_code, r.role_name
    FROM users u
    JOIN roles r ON r.role_id = u.role_id
    WHERE u.email=$1
    LIMIT 1
  `, [email]);
  return r.rows[0] || null;
}

export async function findRoleIdByCode(code) {
  const r = await query('SELECT role_id FROM roles WHERE role_code=$1', [code]);
  return r.rows[0]?.role_id;
}

export async function createUser({ email, passwordHash, fullName, roleId, status, isEmailVerified }) {
  const r = await query(`
    INSERT INTO users (email, password_hash, full_name, role_id, status, is_email_verified)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `, [email, passwordHash || null, fullName, roleId, status, !!isEmailVerified]);
  
  // Fetch with role info
  const user = r.rows[0];
  if (user) {
    const withRole = await findUserByEmail(user.email);
    return withRole;
  }
  return user;
}

export async function findProvider(code) {
  const r = await query('SELECT * FROM auth_providers WHERE provider_code=$1', [code]);
  return r.rows[0] || null;
}

export async function findUserAuthProvider(providerId, providerUserId) {
  const r = await query('SELECT * FROM user_auth_providers WHERE provider_id=$1 AND provider_user_id=$2', [providerId, providerUserId]);
  return r.rows[0] || null;
}

export async function linkUserProvider({ userId, providerId, providerUserId, providerEmail, providerAvatar }) {
  await query(`
    INSERT INTO user_auth_providers (user_id, provider_id, provider_user_id, provider_email, provider_avatar, last_login_at)
    VALUES ($1,$2,$3,$4,$5, NOW())
  `, [userId, providerId, providerUserId, providerEmail, providerAvatar]);
}

export async function insertRefreshToken({ userId, token, expiresAt, createdByIp }) {
  await query(`
    INSERT INTO refresh_tokens (user_id, token, expires_at, created_at, created_by_ip)
    VALUES ($1,$2,$3, NOW(), $4)
  `, [userId, token, expiresAt, createdByIp || null]);
}

export async function revokeRefreshToken(token, reason, ip) {
  await query(`
    UPDATE refresh_tokens
    SET revoked_at = NOW(), revoked_by_ip = $2, reason = $3
    WHERE token=$1 AND revoked_at IS NULL
  `, [token, ip || null, reason || null]);
}

export async function findRefreshToken(token) {
  const r = await query(`
    SELECT rt.*, u.email, u.full_name, u.role_id, u.status, r.role_code
    FROM refresh_tokens rt
    JOIN users u ON u.user_id = rt.user_id
    JOIN roles r ON r.role_id = u.role_id
    WHERE rt.token=$1
  `, [token]);
  return r.rows[0] || null;
}
