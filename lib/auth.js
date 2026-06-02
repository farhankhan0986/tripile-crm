import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const cookie = request.cookies?.get?.('token')?.value;
  if (cookie) return cookie;

  const authHeader = request.headers?.get?.('authorization') || '';
  if (authHeader.startsWith('Bearer ')) return authHeader.slice(7);

  return null;
}
