import { getPool, sql } from '../../../config/pool.js';

export async function findUserByEmail(email) {
  const pool = await getPool();
  const result = await pool.request().input('Email', sql.VarChar(255), email)
    .query('SELECT TOP 1 * FROM Users WHERE Email=@Email');
  return result.recordset[0] || null;
}

export async function findRoleIdByCode(code) {
  const pool = await getPool();
  const r = await pool.request().input('Code', sql.VarChar(30), code)
    .query('SELECT RoleId FROM Roles WHERE RoleCode=@Code');
  return r.recordset[0]?.RoleId;
}

export async function createUser({ email, passwordHash, fullName, roleId, status, isEmailVerified }) {
  const pool = await getPool();
  const result = await pool.request()
    .input('Email', sql.VarChar(255), email)
    .input('PasswordHash', sql.VarBinary(256), passwordHash ? Buffer.from(passwordHash) : null)
    .input('FullName', sql.NVarChar(150), fullName)
    .input('RoleId', sql.Int, roleId)
    .input('Status', sql.VarChar(20), status)
    .input('IsEmailVerified', sql.Bit, isEmailVerified ? 1 : 0)
    .query(`INSERT INTO Users(Email, PasswordHash, FullName, RoleId, Status, IsEmailVerified)
            OUTPUT INSERTED.*
            VALUES(@Email, @PasswordHash, @FullName, @RoleId, @Status, @IsEmailVerified)`);
  return result.recordset[0];
}

export async function findProvider(code) {
  const pool = await getPool();
  const r = await pool.request().input('Code', sql.VarChar(40), code)
    .query('SELECT * FROM AuthProviders WHERE ProviderCode=@Code');
  return r.recordset[0];
}

export async function findUserAuthProvider(providerId, providerUserId) {
  const pool = await getPool();
  const r = await pool.request()
    .input('ProviderId', sql.Int, providerId)
    .input('ProviderUserId', sql.NVarChar(255), providerUserId)
    .query('SELECT * FROM UserAuthProviders WHERE ProviderId=@ProviderId AND ProviderUserId=@ProviderUserId');
  return r.recordset[0];
}

export async function linkUserProvider({ userId, providerId, providerUserId, providerEmail, providerAvatar }) {
  const pool = await getPool();
  await pool.request()
    .input('UserId', sql.Int, userId)
    .input('ProviderId', sql.Int, providerId)
    .input('ProviderUserId', sql.NVarChar(255), providerUserId)
    .input('ProviderEmail', sql.VarChar(255), providerEmail)
    .input('ProviderAvatar', sql.NVarChar(500), providerAvatar)
    .query(`INSERT INTO UserAuthProviders(UserId, ProviderId, ProviderUserId, ProviderEmail, ProviderAvatar, LastLoginAt)
            VALUES(@UserId,@ProviderId,@ProviderUserId,@ProviderEmail,@ProviderAvatar,SYSUTCDATETIME())`);
}

export async function insertRefreshToken({ userId, token, expiresAt, createdByIp }) {
  const pool = await getPool();
  await pool.request()
    .input('UserId', sql.Int, userId)
    .input('Token', sql.VarChar(255), token)
    .input('ExpiresAt', sql.DateTime2, expiresAt)
    .input('CreatedByIp', sql.VarChar(64), createdByIp || null)
    .query('INSERT INTO RefreshTokens(UserId, Token, ExpiresAt, CreatedAt, CreatedByIp) VALUES(@UserId,@Token,@ExpiresAt,SYSUTCDATETIME(),@CreatedByIp)');
}

export async function revokeRefreshToken(token, reason, ip) {
  const pool = await getPool();
  await pool.request()
    .input('Token', sql.VarChar(255), token)
    .input('Reason', sql.NVarChar(200), reason || null)
    .input('Ip', sql.VarChar(64), ip || null)
    .query('UPDATE RefreshTokens SET RevokedAt=SYSUTCDATETIME(), RevokedByIp=@Ip, Reason=@Reason WHERE Token=@Token AND RevokedAt IS NULL');
}

export async function findRefreshToken(token) {
  const pool = await getPool();
  const r = await pool.request().input('Token', sql.VarChar(255), token)
    .query(`SELECT rt.*, u.Email, u.FullName, u.RoleId, u.Status
            FROM RefreshTokens rt
            INNER JOIN Users u ON u.UserId = rt.UserId
            WHERE rt.Token=@Token`);
  return r.recordset[0] || null;
}
