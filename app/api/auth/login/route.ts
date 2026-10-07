import { and, eq, lt, or, isNull, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { adminLoginTokens, adminUsers } from '@/app/lib/db/schema';
import { adminOrigin, hashToken, newToken, validAdminOrigin } from '@/app/lib/auth/session';
import { RESEND_EMAIL_URL } from '@/app/lib/constants';

export const POST = withApi('/api/auth/login', async (request) => {
  if (!validAdminOrigin(request)) return NextResponse.json({ message: 'Invalid request origin.' }, { status: 403 });
  const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(255) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  const from = process.env.ADMIN_EMAIL_FROM || process.env.ORDER_EMAIL_FROM;
  if (!process.env.RESEND_API_KEY || !from) return NextResponse.json({ message: 'Admin email login is not configured.' }, { status: 503 });
  const token = newToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  // Atomic, shared-database cooldown limits delivery across all app instances.
  const admin = await db.transaction(async (tx) => {
    const [user] = await tx.update(adminUsers).set({ lastLoginRequestedAt: now })
      .where(and(eq(adminUsers.email, parsed.data.email), eq(adminUsers.active, true),
        or(isNull(adminUsers.lastLoginRequestedAt), lt(adminUsers.lastLoginRequestedAt, new Date(now.getTime() - 60_000)))))
      .returning({ id: adminUsers.id, email: adminUsers.email });
    if (!user) return null;
    await tx.delete(adminLoginTokens).where(eq(adminLoginTokens.adminId, user.id));
    await tx.insert(adminLoginTokens).values({ adminId: user.id, tokenHash, expiresAt: new Date(now.getTime() + 5 * 60_000) });
    return user;
  });
  if (admin) {
    // Fragment keeps the login secret out of HTTP URLs and access logs.
    const url = `${adminOrigin()}/admin/login#token=${token}`;
    try {
      const response = await fetch(RESEND_EMAIL_URL, {
        method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to: [admin.email], subject: 'Sign in to RITNA admin',
          text: `Sign in to your RITNA admin dashboard:\n\n${url}\n\nThis link expires in 5 minutes and can be used once. If you did not request this email, ignore it.` }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error('Admin login email was not accepted.');
    } catch {
      await db.transaction(async (tx) => {
        await tx.delete(adminLoginTokens).where(eq(adminLoginTokens.tokenHash, tokenHash));
        await tx.update(adminUsers).set({ lastLoginRequestedAt: null }).where(and(eq(adminUsers.id, admin.id), sql`${adminUsers.lastLoginRequestedAt} = ${now}`));
      });
      return NextResponse.json({ message: 'Unable to send a login email. Please try again.' }, { status: 502 });
    }
  }
  return NextResponse.json({ success: true, message: 'If this email belongs to an active admin, a login link has been sent. Please wait a minute before requesting another.' });
});
