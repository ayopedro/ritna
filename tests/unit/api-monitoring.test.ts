import { afterEach, expect, test } from 'bun:test';
import { NextRequest } from 'next/server';
import { requireAdmin } from '../../app/lib/auth/basic';
import { withApi } from '../../app/lib/api/handler';
import { log } from '../../app/lib/logger';

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;
afterEach(() => {
  if (username === undefined) delete process.env.ADMIN_USERNAME; else process.env.ADMIN_USERNAME = username;
  if (password === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = password;
});

function credentials() {
  process.env.ADMIN_USERNAME = 'test-admin';
  process.env.ADMIN_PASSWORD = 'test-password';
  return `Basic ${Buffer.from('test-admin:test-password').toString('base64')}`;
}

test('Basic Auth fails closed and accepts configured credentials', () => {
  delete process.env.ADMIN_USERNAME;
  expect(requireAdmin(new Request('https://ritna.test/admin'))?.status).toBe(503);
  const authorization = credentials();
  expect(requireAdmin(new Request('https://ritna.test/admin'))?.status).toBe(401);
  expect(requireAdmin(new Request('https://ritna.test/admin', { headers: { authorization } }))).toBeNull();
  expect(requireAdmin(new Request('https://ritna.test/admin', { headers: { authorization: 'Basic wrong' } }))?.status).toBe(401);
});

test('private API authorization is enforced without proxy', async () => {
  credentials();
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

test('authenticated cross-origin mutations are rejected', async () => {
  const authorization = credentials();
  const handler = withApi('/api/customers', async () => Response.json({}), true);
  const denied = await handler(new NextRequest('https://ritna.test/api/customers', { method: 'POST', headers: { authorization, origin: 'https://other.test' } }));
  expect(denied.status).toBe(403);
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
