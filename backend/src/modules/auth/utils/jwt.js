import jwt from 'jsonwebtoken';

const accessSecret = process.env.JWT_ACCESS_SECRET || 'access';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh';
const accessExpires = process.env.JWT_ACCESS_EXPIRES || '15m';
const refreshExpires = process.env.JWT_REFRESH_EXPIRES || '30d';

export function signAccessToken(payload) {
  return jwt.sign(payload, accessSecret, { expiresIn: accessExpires });
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, refreshSecret, { expiresIn: refreshExpires });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret);
}
