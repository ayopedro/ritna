import { and, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { adminLoginTokens, adminSessions, adminUsers } from '@/app/lib/db/schema';
import { hashToken, newToken, validToken, validAdminOrigin, sessionCookieOptions, SESSION_COOKIE, SESSION_DURATION_MS } from '@/app/lib/auth/session';

export const POST = withApi('/api/auth/verify', async (request) => {
  if (!validAdminOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  const body = await request.json().catch(() => null);
  if (typeof body?.token !== 'string' || !validToken(body.token)) return NextResponse.json({ message: 'Invalid or expired login link.' }, { status: 400 });
  const sessionToken = newToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const authenticated = await db.transaction(async (tx) => {
    // DELETE ... RETURNING consumes a link atomically, including concurrent clicks.
    const [link] = await tx.delete(adminLoginTokens).where(and(eq(adminLoginTokens.tokenHash, hashToken(body.token)), gt(adminLoginTokens.expiresAt, new Date()))).returning();
    if (!link) return false;
    const [admin] = await tx.select({ id: adminUsers.id }).from(adminUsers).where(and(eq(adminUsers.id, link.adminId), eq(adminUsers.active, true))).limit(1);
    if (!admin) return false;
    await tx.insert(adminSessions).values({ tokenHash: hashToken(sessionToken), adminId: admin.id, expiresAt });
    return true;
  });
  if (!authenticated) return NextResponse.json({ message: 'This login link has expired or has already been used. Request a new link.' }, { status: 400 });
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, sessionToken, { ...sessionCookieOptions, expires: expiresAt });
  return response;
});
