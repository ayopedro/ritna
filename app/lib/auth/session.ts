import { createHash, randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { adminSessions, adminUsers } from '@/app/lib/db/schema';

export const SESSION_COOKIE = 'ritna_admin_session';
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const newToken = () => randomBytes(32).toString('hex');
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
export const validToken = (token: string) => /^[a-f0-9]{64}$/.test(token);

export function requestSessionToken(request: Request) {
  return request.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))?.slice(SESSION_COOKIE.length + 1) ?? '';
}

export async function getAdmin(token: string) {
  if (!validToken(token)) return null;
  const [admin] = await db.select({ id: adminUsers.id, email: adminUsers.email })
    .from(adminSessions).innerJoin(adminUsers, eq(adminSessions.adminId, adminUsers.id))
    .where(and(eq(adminSessions.tokenHash, hashToken(token)), gt(adminSessions.expiresAt, new Date()), eq(adminUsers.active, true))).limit(1);
  return admin ?? null;
}

export async function requireAdmin(request: Request) {
  if (await getAdmin(requestSessionToken(request))) return null;
  return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: 401 });
}

// Use a configured origin for mail links; never trust a caller-supplied Host header.
export function adminOrigin() {
  const url = new URL(process.env.ADMIN_APP_URL ?? 'http://localhost:3000');
  if (process.env.NODE_ENV === 'production' && (!process.env.ADMIN_APP_URL || url.protocol !== 'https:')) {
    throw new Error('ADMIN_APP_URL must be configured with HTTPS.');
  }
  if (!['https:', 'http:'].includes(url.protocol)) throw new Error('Invalid admin origin.');
  return url.origin;
}

export function validAdminOrigin(request: Request) {
  return request.headers.get('origin') === adminOrigin();
}

export const sessionCookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/',
};
