import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { adminSessions } from '@/app/lib/db/schema';
import { hashToken, requestSessionToken, validAdminOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/app/lib/auth/session';

export const POST = withApi('/api/auth/logout', async (request) => {
  if (!validAdminOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, hashToken(requestSessionToken(request))));
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  return response;
});
