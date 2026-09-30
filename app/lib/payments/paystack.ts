import { log } from '@/app/lib/logger';
import type {
  PaystackCheckoutInput,
  PaymentRecord,
  PreorderRecord,
  VerifiedPaystackPayment,
} from '@/app/lib/types';
import {
  PAYSTACK_INITIALIZE_URL,
  PAYSTACK_VERIFY_URL,
} from '@/app/lib/constants';
import {
  paystackInitializeResponseSchema,
  paystackVerifyResponseSchema,
} from '@/app/lib/validators';

export async function initializePaystack(input: PaystackCheckoutInput) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack is not configured.');

  const response = await fetch(PAYSTACK_INITIALIZE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amount * 100),
      currency: 'NGN',
      reference: input.reference,
      metadata: JSON.stringify({ orderId: input.orderId }),
      ...(process.env.PAYSTACK_CALLBACK_URL
        ? { callback_url: process.env.PAYSTACK_CALLBACK_URL }
        : {}),
    }),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });
  const parsed = paystackInitializeResponseSchema.safeParse(
    await response.json(),
  );
  if (
    !response.ok ||
    !parsed.success ||
    parsed.data.data.reference !== input.reference
  ) {
    throw new Error('Paystack initialization failed.');
  }
  log('info', 'payment.initialized', { orderId: input.orderId, provider: 'paystack' });
  return parsed.data.data.authorization_url;
}

export async function verifyPaystack(reference: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack is not configured.');
  const response = await fetch(
    `${PAYSTACK_VERIFY_URL}/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    },
  );
  const body: unknown = await response.json();
  if (response.status === 404) return null;
  const parsed = paystackVerifyResponseSchema.safeParse(body);
  if (
    !response.ok ||
    !parsed.success ||
    parsed.data.data.reference !== reference
  ) {
    throw new Error('Unable to verify payment.');
  }
  return parsed.data.data;
}

export function validatePaymentMatch(
  payment: PaymentRecord,
  order: PreorderRecord,
  verified: VerifiedPaystackPayment,
) {
  if (
    verified.reference !== payment.providerReference ||
    verified.amount !== payment.amount * 100 ||
    verified.currency !== payment.currency ||
    payment.amount !== order.totalAmount ||
    payment.currency !== order.currency ||
    verified.customer.email.toLowerCase() !== order.shippingEmail.toLowerCase()
  ) {
    throw new Error('Payment details do not match the order.');
  }
}
