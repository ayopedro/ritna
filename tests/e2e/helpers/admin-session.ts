import { execFileSync } from 'node:child_process';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import type { BrowserContext } from '@playwright/test';

// Test-only fixture creates a temporary database admin; no auth bypass exists in the app.
export async function adminSession(context: BrowserContext) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  const email = `e2e-${randomUUID()}@example.com`;
  execFileSync('bun', ['--env-file=.env.local', '-e', `
    import { db } from './app/lib/db';
    import { adminUsers, adminSessions } from './app/lib/db/schema';
    const [user] = await db.insert(adminUsers).values({ email: process.argv[1] }).returning();
    await db.insert(adminSessions).values({ adminId: user.id, tokenHash: process.argv[2], expiresAt: new Date(Date.now() + 600000) });
  `, email, tokenHash], { stdio: 'pipe' });
  await context.addCookies([{ name: 'ritna_admin_session', value: token, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' }]);
  return () => {
    execFileSync('bun', ['--env-file=.env.local', '-e', `
      import { eq } from 'drizzle-orm';
      import { db } from './app/lib/db';
      import { adminUsers } from './app/lib/db/schema';
      await db.delete(adminUsers).where(eq(adminUsers.email, process.argv[1]));
    `, email], { stdio: 'pipe' });
  };
}


export async function adminLoginLink(context: BrowserContext) {
  const cleanup = await adminSession(context);
  const session = (await context.cookies()).find((cookie) => cookie.name === 'ritna_admin_session')!;
  const sessionHash = createHash('sha256').update(session.value).digest('hex');
  const token = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(token).digest('hex');
  try {
    execFileSync('bun', ['--env-file=.env.local', '-e', `
      import { eq } from 'drizzle-orm';
      import { db } from './app/lib/db';
      import { adminSessions, adminLoginTokens } from './app/lib/db/schema';
      const [session] = await db.select().from(adminSessions).where(eq(adminSessions.tokenHash, process.argv[1]));
      await db.insert(adminLoginTokens).values({ adminId: session.adminId, tokenHash: process.argv[2], expiresAt: new Date(Date.now() + 300000) });
      await db.delete(adminSessions).where(eq(adminSessions.tokenHash, process.argv[1]));
    `, sessionHash, tokenHash], { stdio: 'pipe' });
    await context.clearCookies();
    return { token, cleanup };
  } catch (error) { cleanup(); throw error; }
}
