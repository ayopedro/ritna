import { afterEach, expect, test } from 'bun:test';
import { getPaymentResultUrl } from '../../app/lib/payments/callback-url';

const originalCallback = process.env.PAYSTACK_CALLBACK_URL;
afterEach(() => {
  if (originalCallback === undefined) delete process.env.PAYSTACK_CALLBACK_URL;
  else process.env.PAYSTACK_CALLBACK_URL = originalCallback;
});

test('configured callback origin overrides the container and proxy hosts', () => {
  process.env.PAYSTACK_CALLBACK_URL = 'https://ritna.example/api/payments/callback';
  const request = new Request('http://0.0.0.0:8080/api/payments/callback', {
    headers: { 'x-forwarded-host': 'other.example' },
  });
  expect(getPaymentResultUrl(request, 'preorder-test').toString()).toBe(
    'https://ritna.example/preorder/payment?reference=preorder-test',
  );
});

test('proxy headers restore the public HTTPS origin when callback configuration is absent', () => {
  delete process.env.PAYSTACK_CALLBACK_URL;
  const request = new Request('http://0.0.0.0:8080/api/payments/callback', {
    headers: {
      'x-forwarded-host': 'ritna.example, internal-proxy',
      'x-forwarded-proto': 'https, http',
      host: '0.0.0.0:8080',
    },
  });
  expect(getPaymentResultUrl(request, 'preorder-test').origin).toBe('https://ritna.example');
});

test('preserves the public Host when the request URL contains the container address', () => {
  delete process.env.PAYSTACK_CALLBACK_URL;
  const request = new Request('http://0.0.0.0:8080/api/payments/callback', {
    headers: { host: 'ritna.example', 'x-forwarded-proto': 'https' },
  });
  expect(getPaymentResultUrl(request, 'preorder-test').origin).toBe('https://ritna.example');
});

test('local development preserves its port and safely encodes the reference', () => {
  delete process.env.PAYSTACK_CALLBACK_URL;
  const destination = getPaymentResultUrl(new Request('http://localhost:3000/api/payments/callback'), 'test&other=value');
  expect(destination.origin).toBe('http://localhost:3000');
  expect([...destination.searchParams]).toEqual([['reference', 'test&other=value']]);
});

test('rejects bind addresses and non-HTTP callback origins', () => {
  for (const value of ['http://0.0.0.0:8080/api/payments/callback', 'http://[::]:8080', 'javascript:alert(1)']) {
    process.env.PAYSTACK_CALLBACK_URL = value;
    expect(() => getPaymentResultUrl(new Request('http://localhost:3000'), 'test')).toThrow();
  }
  delete process.env.PAYSTACK_CALLBACK_URL;
  expect(() => getPaymentResultUrl(new Request('http://0.0.0.0:8080'), 'test')).toThrow();
});
