import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export const hash = (text: string) => createHash('sha256').update(text).digest('hex');
export const token = () => randomBytes(32).toString('base64url');
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function verifyPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(':');
  if (!salt || !digest) return false;
  const expected = Buffer.from(digest, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}
export function cookieValue(header: string | undefined, name: string) {
  const entry = (header || '').split(';').find(item => item.trim().startsWith(`${name}=`));
  return entry?.trim().slice(name.length + 1);
}
export function makeCookie(name: string, value: string, age: number) {
  return `${name}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${process.env.NODE_ENV === 'production' || process.env.VERCEL ? '; Secure' : ''}`;
}
