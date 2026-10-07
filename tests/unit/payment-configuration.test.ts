import { afterEach, expect, test } from 'bun:test';
import {
  configuredProvider,
  isPaymentConfigured,
} from '../../app/lib/payments/configuration';
import { getPaymentResultUrl } from '../../app/lib/payments/callback-url';

const keys = [
  'PAYMENT_PROVIDER',
  'PAYSTACK_SECRET_KEY',
  'BACHS_API_KEY',
  'BACHS_CALLBACK_URL',
] as const;
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
afterEach(() => {
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
});

test('new preorders default to Bachs and do not require a Paystack key', () => {
  delete process.env.PAYMENT_PROVIDER;
  delete process.env.PAYSTACK_SECRET_KEY;
  process.env.BACHS_API_KEY = 'sk_sandbox_test';
  process.env.BACHS_CALLBACK_URL =
    'https://ritna.example/api/payments/callback';
  expect(configuredProvider()).toBe('bachs');
  expect(isPaymentConfigured()).toBe(true);
  expect(
    getPaymentResultUrl(new Request('http://localhost:3000'), 'preorder-test')
      .origin,
  ).toBe('https://ritna.example');
});

test('Paystack credentials alone cannot activate Bachs checkout', () => {
  process.env.PAYMENT_PROVIDER = 'bachs';
  process.env.PAYSTACK_SECRET_KEY = 'test';
  delete process.env.BACHS_API_KEY;
  delete process.env.BACHS_CALLBACK_URL;
  expect(isPaymentConfigured()).toBe(false);
});

test('Paystack must be selected explicitly and requires its own credentials', () => {
  process.env.PAYMENT_PROVIDER = 'paystack';
  delete process.env.PAYSTACK_SECRET_KEY;
  expect(configuredProvider()).toBe('paystack');
  expect(isPaymentConfigured()).toBe(false);
  process.env.PAYSTACK_SECRET_KEY = 'test';
  expect(isPaymentConfigured()).toBe(true);
});

test('invalid provider selection fails closed', () => {
  process.env.PAYMENT_PROVIDER = 'unknown';
  expect(configuredProvider).toThrow('Invalid payment provider.');
  expect(isPaymentConfigured()).toBe(false);
});
