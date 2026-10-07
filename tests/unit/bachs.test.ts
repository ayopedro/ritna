import { afterEach, expect, test } from 'bun:test';
import { createHmac } from 'node:crypto';
import { initializeBachs, verifyBachs, verifyBachsSignature } from '../../app/lib/payments/bachs';
import type { PaymentRecord, PreorderRecord } from '../../app/lib/types';

const originalFetch = globalThis.fetch;
const originalKey = process.env.BACHS_API_KEY;
const originalCallback = process.env.BACHS_CALLBACK_URL;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.BACHS_API_KEY;
  else process.env.BACHS_API_KEY = originalKey;
  if (originalCallback === undefined) delete process.env.BACHS_CALLBACK_URL;
  else process.env.BACHS_CALLBACK_URL = originalCallback;
});
const payment = { providerCheckoutId: 'chk_test', providerReference: 'preorder-test', amount: 1000, currency: 'NGN' } as PaymentRecord;
const order = { id: 'order-test', totalAmount: 1000, currency: 'NGN', shippingEmail: 'buyer@example.com' } as PreorderRecord;
const session = {
  checkout_id: 'chk_test', reference: 'preorder-test', amount: '1000.00', currency: 'NGN',
  status: 'completed', payment_status: 'succeeded', customer: { email: 'buyer@example.com' },
  metadata: { orderId: 'order-test' }, charge: { status: 'succeeded', amount: '1000.00', currency: 'NGN', amount_paid: '1000.00' },
};
function mockSession(body: unknown) {
  process.env.BACHS_API_KEY = 'sk_sandbox_test';
  globalThis.fetch = (async () => Response.json(body)) as unknown as typeof fetch;
}

test('creates sandbox checkout with NGN major units, customer, reference and stable idempotency', async () => {
  process.env.BACHS_API_KEY = 'sk_sandbox_test';
  process.env.BACHS_CALLBACK_URL = 'https://ritna.example/api/payments/callback';
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    expect(url).toBe('https://sandbox-api.bachs.io/v1/checkout-sessions');
    expect(new Headers(init?.headers).get('Idempotency-Key')).toBe('preorder-test');
    const body = JSON.parse(String(init?.body));
    expect(body.pricing).toEqual({ amount: '1000.00', currency: 'NGN', price_type: 'fixed' });
    expect(body.customer).toEqual({ email: 'buyer@example.com', name: 'Buyer' });
    expect(new URL(body.success_url).searchParams.get('reference')).toBe('preorder-test');
    return Response.json({ checkout_id: 'chk_test', reference: 'preorder-test', checkout_url: 'https://checkout.bachs.io/c/test' });
  }) as unknown as typeof fetch;
  expect(await initializeBachs({ name: 'Buyer', email: 'buyer@example.com', amount: 1000, reference: 'preorder-test', orderId: 'order-test' })).toEqual({ providerCheckoutId: 'chk_test', authorizationUrl: 'https://checkout.bachs.io/c/test' });
});

test('rejects checkout redirects outside Bachs and mismatched references', async () => {
  process.env.BACHS_API_KEY = 'sk_live_test';
  process.env.BACHS_CALLBACK_URL = 'https://ritna.example/api/payments/callback';
  for (const body of [
    { checkout_id: 'chk_test', reference: 'preorder-test', checkout_url: 'https://evil.example' },
    { checkout_id: 'chk_test', reference: 'other', checkout_url: 'https://checkout.bachs.io/c/test' },
  ]) {
    globalThis.fetch = (async (url: string | URL | Request) => {
      expect(String(url)).toStartWith('https://api.bachs.io/');
      return Response.json(body);
    }) as unknown as typeof fetch;
    await expect(initializeBachs({ name: 'Buyer', email: 'buyer@example.com', amount: 1000, reference: 'preorder-test', orderId: 'order-test' })).rejects.toThrow();
  }
});

test('confirms only a completed checkout with a fully settled matching charge', async () => {
  mockSession(session);
  expect((await verifyBachs(payment, order))?.status).toBe('success');
  for (const override of [
    { reference: 'other' }, { checkout_id: 'other' }, { amount: '999.00' }, { currency: 'USD' },
    { customer: { email: 'other@example.com' } }, { metadata: { orderId: 'other' } },
    { charge: { ...session.charge, amount_paid: '999.00' } },
    { charge: { ...session.charge, currency: 'USD' } },
  ]) {
    mockSession({ ...session, ...override });
    await expect(verifyBachs(payment, order)).rejects.toThrow();
  }
  for (const override of [{ charge: null }, { payment_status: 'processing' }, { charge: { ...session.charge, status: 'underpaid' } }]) {
    mockSession({ ...session, ...override });
    expect((await verifyBachs(payment, order))?.status).toBe('pending');
  }
});

test('keeps failed attempts in open sessions retryable but treats expiry as terminal', async () => {
  mockSession({ ...session, status: 'open', payment_status: 'failed', charge: null });
  expect((await verifyBachs(payment, order))?.status).toBe('pending');
  mockSession({ ...session, status: 'expired', payment_status: null, charge: null });
  expect((await verifyBachs(payment, order))?.status).toBe('failed');
  expect(await verifyBachs({ ...payment, providerCheckoutId: null }, order)).toBeNull();
});

test('checks raw-body webhook signatures and rejects tampering, stale and future timestamps', () => {
  const now = 1800000000000;
  const timestamp = String(now / 1000);
  const raw = '{"type":"collection.succeeded"}';
  const headers = new Headers({ 'x-bachs-timestamp': timestamp, 'x-bachs-signature': createHmac('sha256', 'secret').update(`${timestamp}.${raw}`).digest('hex') });
  expect(verifyBachsSignature(raw, headers, 'secret', now)).toBe(true);
  expect(verifyBachsSignature(raw + ' ', headers, 'secret', now)).toBe(false);
  expect(verifyBachsSignature(raw, headers, 'wrong', now)).toBe(false);
  expect(verifyBachsSignature(raw, headers, 'secret', now + 301000)).toBe(false);
  expect(verifyBachsSignature(raw, headers, 'secret', now - 301000)).toBe(false);
  expect(verifyBachsSignature(raw, new Headers(), 'secret', now)).toBe(false);
});

test('checkout response accepts Bachs and rejects lookalike or credential-bearing URLs', async () => {
  const { preorderCheckoutResponseSchema } = await import('../../app/lib/validators');
  for (const [paymentUrl, valid] of [
    ['https://checkout.bachs.io/c/test', true],
    ['https://checkout.paystack.com/test', true],
    ['https://checkout.bachs.io.evil.example/c/test', false],
    ['https://user@checkout.bachs.io/c/test', false],
    ['http://checkout.bachs.io/c/test', false],
  ] as const) {
    expect(preorderCheckoutResponseSchema.safeParse({ success: true, data: { orderId: '123e4567-e89b-42d3-a456-426614174000', paymentUrl } }).success).toBe(valid);
  }
});
