import { afterEach, expect, test } from 'bun:test';
import { pendingPaymentExpiryHours } from '../../app/lib/payments/expire-pending-payments';

const originalExpiry = process.env.PENDING_PAYMENT_EXPIRY_HOURS;

afterEach(() => {
  if (originalExpiry === undefined) delete process.env.PENDING_PAYMENT_EXPIRY_HOURS;
  else process.env.PENDING_PAYMENT_EXPIRY_HOURS = originalExpiry;
});

test('uses a 24-hour default and validates the configured payment expiry', () => {
  delete process.env.PENDING_PAYMENT_EXPIRY_HOURS;
  expect(pendingPaymentExpiryHours()).toBe(24);
  process.env.PENDING_PAYMENT_EXPIRY_HOURS = '48';
  expect(pendingPaymentExpiryHours()).toBe(48);
  process.env.PENDING_PAYMENT_EXPIRY_HOURS = '0';
  expect(() => pendingPaymentExpiryHours()).toThrow(
    'PENDING_PAYMENT_EXPIRY_HOURS must be an integer between 1 and 168.',
  );
});
