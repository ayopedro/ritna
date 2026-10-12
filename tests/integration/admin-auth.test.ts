import { afterAll, expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../app/lib/db';
import { adminUsers, adminLoginTokens, adminSessions, books, orders, customers } from '../../app/lib/db/schema';
import { POST as login } from '../../app/api/auth/login/route';
import { POST as verify } from '../../app/api/auth/verify/route';
import { POST as logout } from '../../app/api/auth/logout/route';
import { PATCH as updateBook } from '../../app/api/admin/books/[bookId]/route';
import { createPreorder } from '../../app/lib/orders/create-preorder';
import { hashToken, newToken, requireAdmin, SESSION_COOKIE } from '../../app/lib/auth/session';

// Dedicated fixtures; never send mail or alter the real administrator/catalog.
const email = `auth-test-${crypto.randomUUID()}@example.com`;
let adminId: string;
let bookId: string;
let customerId: string | undefined;
let orderId: string | undefined;
const originalFetch = globalThis.fetch;
const originalOrigin = process.env.ADMIN_APP_URL;
const originalKey = process.env.RESEND_API_KEY;
const originalFrom = process.env.ADMIN_EMAIL_FROM;
const request = (path: string, body: unknown, cookie = '', origin = 'http://localhost:3000') => new NextRequest(`http://localhost:3000${path}`, {
  method: 'POST', headers: { origin, cookie, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
afterAll(async () => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of Object.entries({ ADMIN_APP_URL: originalOrigin, RESEND_API_KEY: originalKey, ADMIN_EMAIL_FROM: originalFrom })) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
  if (orderId) { const { orderItems } = await import('../../app/lib/db/schema'); await db.delete(orderItems).where(eq(orderItems.orderId, orderId)); await db.delete(orders).where(eq(orders.id, orderId)); }
  if (customerId) await db.delete(customers).where(eq(customers.id, customerId));
  if (bookId) await db.delete(books).where(eq(books.id, bookId));
  if (adminId) await db.delete(adminUsers).where(eq(adminUsers.id, adminId));
});

test('magic links, session revocation, private book mutations and checkout enforcement', async () => {
  process.env.ADMIN_APP_URL = 'http://localhost:3000';
  process.env.RESEND_API_KEY = 'test-key';
  process.env.ADMIN_EMAIL_FROM = 'test@example.com';
  [ { id: adminId } ] = await db.insert(adminUsers).values({ email }).returning({ id: adminUsers.id });
  [ { id: bookId } ] = await db.insert(books).values({ title: 'Auth test book', price: 100, available: true, type: 'softcover' }).returning({ id: books.id });
  let sent = 0;
  let linkToken = '';
  globalThis.fetch = (async (_url, options) => {
    sent++;
    const payload = JSON.parse(options!.body as string);
    linkToken = payload.text.match(/#token=([a-f0-9]{64})/)[1];
    expect(payload.to).toEqual([email]);
    expect(payload.text).toContain("expires in 5 minutes");
    return Response.json({ id: 'test-email' });
  }) as typeof fetch;
  expect((await login(request('/api/auth/login', { email }, '', 'https://evil.test'))).status).toBe(403);
  expect((await login(request('/api/auth/login', { email: 'unknown@example.com' }))).status).toBe(200);
  expect(sent).toBe(0);
  expect((await login(request('/api/auth/login', { email: email.toUpperCase() }))).status).toBe(200);
  expect(sent).toBe(1);
  expect((await login(request('/api/auth/login', { email }))).status).toBe(200);
  expect(sent).toBe(1);
  const [stored] = await db.select().from(adminLoginTokens).where(eq(adminLoginTokens.adminId, adminId));
  expect(stored.tokenHash).toBe(hashToken(linkToken));
  const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.id, adminId));
  expect(stored.expiresAt.getTime() - admin.lastLoginRequestedAt!.getTime()).toBe(5 * 60_000);
  const responses = await Promise.all([verify(request('/api/auth/verify', { token: linkToken })), verify(request('/api/auth/verify', { token: linkToken }))]);
  expect(responses.map((response) => response.status).sort()).toEqual([200, 400]);
  const setCookie = responses.find((response) => response.status === 200)!.headers.get('set-cookie')!;
  expect(setCookie).toContain('HttpOnly');
  expect(setCookie).toContain('SameSite=lax');
  const cookie = setCookie.split(';')[0];
  expect(await requireAdmin(new Request('http://localhost:3000/api/admin/overview', { headers: { cookie } }))).toBeNull();
  const patch = (body: unknown, cookieValue = cookie, origin = 'http://localhost:3000') => updateBook(new NextRequest(`http://localhost:3000/api/admin/books/${bookId}`, { method: 'PATCH', headers: { cookie: cookieValue, origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), { params: Promise.resolve({ bookId }) });
  expect((await patch({ price: 123, available: true }, '')).status).toBe(401);
  expect((await patch({ price: 123, available: true }, cookie, 'https://evil.test')).status).toBe(403);
  expect((await patch({ price: -1, available: true })).status).toBe(400);
  expect((await patch({ price: 0, available: true })).status).toBe(400);
  expect((await patch({ price: 123, available: true, title: '' })).status).toBe(400);
  const updated = await patch({ price: 123, available: true, title: 'Updated test book', description: 'A new description', type: 'institutional', image: '/assets/cover.jpg' });
  expect(updated.status).toBe(200);
  expect((await updated.json()).data).toMatchObject({ title: 'Updated test book', description: 'A new description', type: 'institutional', image: '/assets/cover.jpg' });
  const input = { items: [{ id: bookId, quantity: 2 }], customer: { fullName: 'Auth Test', email, address: '1 Test St', city: 'Lagos', state: 'Lagos' } };
  const created = await createPreorder(input, crypto.randomUUID());
  expect(created.status).toBe(201);
  orderId = created.order!.id; customerId = created.order!.customerId;
  expect(created.order!.totalAmount).toBe(246);
  expect((await patch({ price: 456, available: false })).status).toBe(200);
  expect((await createPreorder(input, crypto.randomUUID())).status).toBe(422);
  const [saved] = await db.select().from(orders).where(eq(orders.id, orderId));
  expect(saved.totalAmount).toBe(246);
  await db.update(adminUsers).set({ active: false }).where(eq(adminUsers.id, adminId));
  expect((await requireAdmin(new Request('http://localhost:3000', { headers: { cookie } })))?.status).toBe(401);
  await db.update(adminUsers).set({ active: true }).where(eq(adminUsers.id, adminId));
  expect((await logout(request('/api/auth/logout', {}, cookie))).status).toBe(200);
  expect((await requireAdmin(new Request('http://localhost:3000', { headers: { cookie } })))?.status).toBe(401);
  const expiredToken = newToken();
  await db.insert(adminLoginTokens).values({ tokenHash: hashToken(expiredToken), adminId, expiresAt: new Date(0) });
  expect((await verify(request('/api/auth/verify', { token: expiredToken }))).status).toBe(400);
  const expiredSession = newToken();
  await db.insert(adminSessions).values({ tokenHash: hashToken(expiredSession), adminId, expiresAt: new Date(0) });
  expect((await requireAdmin(new Request('http://localhost:3000', { headers: { cookie: `${SESSION_COOKIE}=${expiredSession}` } })))?.status).toBe(401);
  expect(await db.select().from(adminSessions).where(and(eq(adminSessions.adminId, adminId), eq(adminSessions.tokenHash, hashToken(cookie.split('=')[1]))))).toHaveLength(0);
});
