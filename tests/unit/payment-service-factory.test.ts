import { afterEach, expect, test } from 'bun:test';
import {
  BachsPaymentService,
  PaystackPaymentService,
  getPaymentService,
} from '../../app/lib/payments/payment-service-factory';
import { isTrustedCheckoutUrl } from '../../app/lib/payments/checkout-url';

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('factory selects provider services and rejects unknown or inherited property names', () => {
  expect(getPaymentService('bachs')).toBeInstanceOf(BachsPaymentService);
  expect(getPaymentService('paystack')).toBeInstanceOf(PaystackPaymentService);
  for (const provider of ['unknown', 'constructor', '__proto__'])
    expect(() => getPaymentService(provider)).toThrow(
      'Unknown payment provider.',
    );
});

test('services reject unsupported currencies before contacting a provider', async () => {
  globalThis.fetch = (async () => {
    throw new Error('Should not make a request');
  }) as unknown as typeof fetch;
  for (const provider of ['bachs', 'paystack']) {
    await expect(
      getPaymentService(provider).initialize({
        email: 'buyer@example.com',
        name: 'Buyer',
        amount: 100,
        currency: 'USD',
        reference: 'preorder-test',
        orderId: 'order-test',
      }),
    ).rejects.toThrow('NGN only');
  }
});

test('checkout URLs accept Bachs-owned HTTPS hosts and reject lookalikes, credentials and ports', () => {
  expect(
    isTrustedCheckoutUrl('https://sandbox-checkout.bachs.io/c/test', 'bachs'),
  ).toBe(true);
  expect(
    isTrustedCheckoutUrl('https://checkout.bachs.io/c/test', 'bachs'),
  ).toBe(true);
  for (const url of [
    'https://bachs.io.evil.example',
    'https://evilbachs.io',
    'http://checkout.bachs.io',
    'https://user@checkout.bachs.io',
    'https://checkout.bachs.io:8443',
    'https://checkout.paystack.com',
  ]) {
    expect(isTrustedCheckoutUrl(url, 'bachs')).toBe(false);
  }
});
