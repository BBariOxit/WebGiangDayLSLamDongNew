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
  const accessToken = signAccessToken({ sub: user.UserId, role: user.RoleId });
  const refreshToken = signRefreshToken({ sub: user.UserId });
  const refreshExpMs = parseExpiry(process.env.JWT_REFRESH_EXPIRES || '30d');
  const expiresAt = new Date(Date.now() + refreshExpMs);
  // store refresh
  insertRefreshToken({ userId: user.UserId, token: refreshToken, expiresAt });
  return {
    user: { id: user.UserId, email: user.Email, name: user.FullName, roleId: user.RoleId, status: user.Status },
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
  if (!(await comparePassword(password, user.PasswordHash?.toString()))) throw new Error('Invalid credentials');
  if (user.Status === 'Disabled') throw new Error('Account disabled');
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
  if (new Date(stored.ExpiresAt) < new Date()) throw new Error('Refresh token expired');
  const payload = verifyRefreshToken(token);
  const userId = payload.sub;
  const user = { UserId: userId, Email: stored.Email, FullName: stored.FullName }; // minimal; optionally refetch user
  // rotate token: revoke old, issue new
  await revokeRefreshToken(token, 'rotated');
  return buildAuthResponse({ UserId: userId, Email: stored.Email, FullName: stored.FullName, RoleId: payload.roleId || 0, Status: 'Active' });
}

export async function logout({ refreshToken }) {
  if (refreshToken) await revokeRefreshToken(refreshToken, 'logout');
  return { success: true };
}
