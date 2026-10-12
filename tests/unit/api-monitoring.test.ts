import { expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { requireAdmin, validAdminOrigin, hashToken, newToken, requestSessionToken } from '../../app/lib/auth/session';
import { withApi } from '../../app/lib/api/handler';
import { log } from '../../app/lib/logger';

test('missing, malformed, and Basic Auth credentials fail closed', async () => {
  for (const headers of [{}, { authorization: 'Basic dGVzdDp0ZXN0' }, { cookie: 'ritna_admin_session=invalid' }] as Record<string, string>[]) {
    expect((await requireAdmin(new Request('https://ritna.test/admin', { headers })))?.status).toBe(401);
  }
  const token = newToken();
  expect(token).toHaveLength(64);
  expect(hashToken(token)).toHaveLength(64);
  expect(hashToken(token)).not.toBe(token);
  expect(requestSessionToken(new Request('https://ritna.test', { headers: { cookie: `other=value; ritna_admin_session=${token}` } }))).toBe(token);
});

test('private API authorization is enforced without proxy', async () => {
  let called = false;
  const handler = withApi('/api/admin/overview', async () => { called = true; return Response.json({}); }, true);
  const response = await handler(new NextRequest('https://ritna.test/api/admin/overview'));
  expect(response.status).toBe(401);
  expect(called).toBe(false);
  expect(response.headers.get('x-request-id')).toBeTruthy();
});

test('API errors do not expose database details', async () => {
  const handler = withApi('/api/test', async () => { throw new Error('secret database password'); });
  const response = await handler(new NextRequest('https://ritna.test/api/test'));
  expect(response.status).toBe(500);
  expect(await response.text()).not.toContain('secret database password');
});

test('admin origin check rejects missing and cross-origin headers', () => {
  const original = process.env.ADMIN_APP_URL;
  process.env.ADMIN_APP_URL = 'https://ritna.test';
  try {
    expect(validAdminOrigin(new Request('https://ritna.test/api/auth/login'))).toBe(false);
    expect(validAdminOrigin(new Request('https://ritna.test/api/auth/login', { headers: { origin: 'https://other.test' } }))).toBe(false);
    expect(validAdminOrigin(new Request('https://ritna.test/api/auth/login', { headers: { origin: 'https://ritna.test' } }))).toBe(true);
  } finally {
    if (original === undefined) delete process.env.ADMIN_APP_URL; else process.env.ADMIN_APP_URL = original;
  }
});

test('logger only accepts approved metadata fields', () => {
  const original = console.info;
  const lines: string[] = [];
  console.info = (line: string) => { lines.push(line); };
  try {
    log('info', 'test.event', { orderId: 'order-test', password: 'secret', email: 'private@example.com' } as Parameters<typeof log>[2]);
  } finally { console.info = original; }
  expect(lines[0]).toContain('order-test');
  expect(lines[0]).not.toContain('secret');
  expect(lines[0]).not.toContain('private@example.com');
});

test('request contexts stay isolated across concurrent requests', async () => {
  const original = console.info;
  const lines: string[] = [];
  console.info = (line: string) => { lines.push(line); };
  try {
    const handler = withApi('/api/concurrent', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1));
      log('info', 'test.inside_request');
      return Response.json({ success: true });
    });
    const responses = await Promise.all([handler(new NextRequest('https://ritna.test/api/concurrent?email=private@example.com')), handler(new NextRequest('https://ritna.test/api/concurrent'))]);
    const ids = responses.map((response) => response.headers.get('x-request-id'));
    expect(ids[0]).not.toBe(ids[1]);
    const events = lines.map((line) => JSON.parse(line));
    for (const id of ids) expect(events.filter((event) => event.requestId === id).length).toBe(2);
    expect(lines.join('')).not.toContain('private@example.com');
  } finally { console.info = original; }
});
