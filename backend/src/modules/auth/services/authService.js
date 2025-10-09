import { comparePassword, hashPassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { verifyGoogleIdToken } from '../utils/googleVerify.js';
import {
  findUserByEmail,
  findRoleIdByCode,
  createUser,
  findProvider,
  findUserAuthProvider,
  linkUserProvider,
  insertRefreshToken,
  findRefreshToken,
  revokeRefreshToken
} from '../repositories/authRepo.js';

function buildAuthResponse(user) {
  // user fields could be camel/snake from repo; normalize
  const id = user.UserId ?? user.user_id;
  const email = user.Email ?? user.email;
  const fullName = user.FullName ?? user.full_name;
  const roleId = user.RoleId ?? user.role_id;
  const status = user.Status ?? user.status;
  const roleCode = user.role_code || user.role || roleId;
  // Normalize role to lowercase for consistent frontend checks
  const role = typeof roleCode === 'string' ? roleCode.toLowerCase() : roleCode;

  const accessToken = signAccessToken({ sub: id, role });
  // use normalized id for refresh token subject (previously could be undefined if UserId not present)
  const refreshToken = signRefreshToken({ sub: id });
  const refreshExpMs = parseExpiry(process.env.JWT_REFRESH_EXPIRES || '30d');
  const expiresAt = new Date(Date.now() + refreshExpMs);
  // store refresh
  insertRefreshToken({ userId: id, token: refreshToken, expiresAt });
  return {
    user: { id, email, name: fullName, roleId, status, role },
    accessToken,
    refreshToken
  };
}

function parseExpiry(str) { // very simple parser (m/h/d)
  const m = str.match(/(\d+)([mhd])/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const val = parseInt(m[1], 10);
  switch (m[2]) {
    case 'm': return val * 60 * 1000;
    case 'h': return val * 60 * 60 * 1000;
    case 'd': return val * 24 * 60 * 60 * 1000;
    default: return val;
  }
}

export async function registerLocal({ email, password, name, role = 'Student' }) {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error('Email already exists');
  const roleId = await findRoleIdByCode(role === 'Teacher' ? 'Teacher' : role === 'Admin' ? 'Admin' : 'Student');
  if (!roleId) throw new Error('Role not found');
  const passwordHash = await hashPassword(password);
  const status = role === 'Teacher' ? 'Pending' : 'Active';
  const user = await createUser({ email, passwordHash, fullName: name, roleId, status, isEmailVerified: false });
  return buildAuthResponse(user);
}

export async function loginLocal({ email, password }) {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid credentials');
  
  const passwordHash = user.password_hash;
  if (!passwordHash) throw new Error('Invalid credentials');
  
  const isValid = await comparePassword(password, passwordHash);
  if (!isValid) throw new Error('Invalid credentials');
  if ((user.Status ?? user.status) === 'Disabled') throw new Error('Account disabled');
  return buildAuthResponse(user);
}

export async function loginGoogle({ idToken }) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const g = await verifyGoogleIdToken(idToken, googleClientId);
  if (!g.email) throw new Error('Google account has no email');

  let user = await findUserByEmail(g.email);
  const provider = await findProvider('google');
  if (!provider) throw new Error('Google provider not configured');

  let link = await findUserAuthProvider(provider.ProviderId, g.sub);

  if (!user) {
    // create user with verified email
    const studentRoleId = await findRoleIdByCode('Student');
    user = await createUser({ email: g.email, passwordHash: null, fullName: g.name || g.email, roleId: studentRoleId, status: 'Active', isEmailVerified: g.emailVerified });
  }

  if (!link) {
    await linkUserProvider({ userId: user.UserId, providerId: provider.ProviderId, providerUserId: g.sub, providerEmail: g.email, providerAvatar: g.picture });
  }

  return buildAuthResponse(user);
}

export async function refreshSession({ token }) {
  if (!token) throw new Error('No token provided');
  const stored = await findRefreshToken(token);
  if (!stored || stored.RevokedAt) throw new Error('Invalid refresh token');
  if (new Date((stored.ExpiresAt ?? stored.expires_at)) < new Date()) throw new Error('Refresh token expired');
  const payload = verifyRefreshToken(token); // ensure signature
  if (payload.sub !== (stored.UserId ?? stored.user_id)) throw new Error('Token user mismatch');
  await revokeRefreshToken(token, 'rotated');
  return buildAuthResponse({
    UserId: stored.UserId ?? stored.user_id,
    Email: stored.Email ?? stored.email,
    FullName: stored.FullName ?? stored.full_name,
    RoleId: stored.RoleId ?? stored.role_id,
    Status: stored.Status ?? stored.status,
    role_code: stored.role_code
  });
}

export async function logout({ refreshToken }) {
  if (refreshToken) await revokeRefreshToken(refreshToken, 'logout');
  return { success: true };
}
