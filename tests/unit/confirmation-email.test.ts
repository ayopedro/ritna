import { afterEach, expect, test } from 'bun:test';
import {
  buildConfirmationEmail,
  sendConfirmationEmail,
} from '../../app/lib/email/confirmation';
import type { PreorderRecord } from '../../app/lib/types';

const originalFetch = globalThis.fetch;
const originalKey = process.env.RESEND_API_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = originalKey;
});
const order = {
  id: 'order-test',
  shippingFullName: 'Test Reader',
  shippingEmail: 'reader@example.com',
  shippingAddressLine1: '1 Main Street',
  shippingAddressLine2: null,
  shippingCity: 'Lagos',
  shippingState: 'Lagos',
  totalAmount: 70000,
} as PreorderRecord;
const payload = buildConfirmationEmail(
  order,
  [{ title: 'RITNA Hardcover', quantity: 2, unitPrice: 35000 }],
  'RITNA <orders@example.com>',
  'support@example.com',
);

test('confirmation includes order details and excludes a delivery timeline', () => {
  expect(payload.to).toEqual(['reader@example.com']);
  expect(payload.reply_to).toBe('support@example.com');
  for (const value of [
    'order-test',
    'RITNA Hardcover × 2',
    '70,000',
    '1 Main Street',
    'Lagos',
    'support@example.com',
  ])
    expect(payload.text).toContain(value);
  expect(payload.text).not.toMatch(
    /timeline|expected delivery|arrives|business days/i,
  );
});

test('email retries use the same provider idempotency key and payload', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  const requests: string[] = [];
  globalThis.fetch = (async (
    _url: Parameters<typeof fetch>[0],
    options?: RequestInit,
  ) => {
    expect(new Headers(options?.headers).get('Idempotency-Key')).toBe(
      'preorder-confirmation/order-test',
    );
    requests.push(options?.body as string);
    return Response.json({ id: 'email-test' });
  }) as unknown as typeof fetch;
  expect(await sendConfirmationEmail(payload, order.id)).toBe('email-test');
  await sendConfirmationEmail(payload, order.id);
  expect(requests[0]).toBe(requests[1]);
});

test('email provider failures are surfaced for retry', async () => {
  process.env.RESEND_API_KEY = 'test-key';
  globalThis.fetch = (async () =>
    Response.json(
      { message: 'Unavailable' },
      { status: 503 },
    )) as unknown as typeof fetch;
  await expect(sendConfirmationEmail(payload, order.id)).rejects.toThrow();
});
