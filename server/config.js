import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET;
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'fallback_secret_change_me') {
  throw new Error('Set JWT_SECRET to a unique random secret of at least 32 characters.');
}
if (!ADMIN_USERNAME || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12 || ADMIN_PASSWORD === 'admin123') {
  throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD (at least 12 characters, or a bcrypt hash).');
}
