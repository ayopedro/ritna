import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { PaystackCheckoutInput, PaymentRecord, PreorderRecord } from '@/app/lib/types';

function configuration() {
  const secret = process.env.BACHS_API_KEY;
  if (!secret || !/^sk_(sandbox|live)_/.test(secret)) throw new Error('Bachs is not configured.');
  return { secret, base: secret.startsWith('sk_sandbox_') ? 'https://sandbox-api.bachs.io' : 'https://api.bachs.io' };
}

async function request(path: string, init: RequestInit = {}) {
  const { secret, base } = configuration();
  return fetch(`${base}/v1/${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', ...init.headers },
    signal: AbortSignal.timeout(15000), cache: 'no-store',
  });
}

const checkoutSchema = z.object({
  checkout_id: z.string().min(1), reference: z.string(),
  checkout_url: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'checkout.bachs.io' && !url.username && !url.password;
  }),
});

export async function initializeBachs(input: PaystackCheckoutInput & { name: string }) {
  const callback = process.env.BACHS_CALLBACK_URL;
  if (!callback) throw new Error('Bachs callback URL is not configured.');
  const successUrl = new URL(callback);
  if (!['http:', 'https:'].includes(successUrl.protocol) || successUrl.username || successUrl.password) throw new Error('Invalid Bachs callback URL.');
  successUrl.searchParams.set('reference', input.reference);
  const response = await request('checkout-sessions', {
    method: 'POST', headers: { 'Idempotency-Key': input.reference },
    body: JSON.stringify({
      reference: input.reference, customer: { email: input.email, name: input.name },
      pricing: { amount: input.amount.toFixed(2), currency: 'NGN', price_type: 'fixed' },
      billing_currency: 'NGN', payment_method_types: ['NGN_CARD', 'NGN_BANK_TRANSFER'],
      success_url: successUrl.toString(), metadata: { orderId: input.orderId },
    }),
  });
  const parsed = checkoutSchema.safeParse(await response.json());
  if (!response.ok || !parsed.success || parsed.data.reference !== input.reference) throw new Error('Bachs initialization failed.');
  return { authorizationUrl: parsed.data.checkout_url, providerCheckoutId: parsed.data.checkout_id };
}

const sessionSchema = z.object({
  checkout_id: z.string(), reference: z.string(), amount: z.string().regex(/^\d+(\.\d{1,2})?$/), currency: z.string(),
  status: z.enum(['open', 'completed', 'expired', 'cancelled']),
  payment_status: z.string().nullable().optional(),
  customer: z.object({ email: z.string().nullable() }).nullable(),
  completed_at: z.iso.datetime().nullable().optional(),
  metadata: z.object({ orderId: z.string() }),
  charge: z.object({ status: z.string(), amount: z.string(), currency: z.string(), amount_paid: z.string().nullable().optional() }).nullable().optional(),
});

export async function verifyBachs(payment: PaymentRecord, order: PreorderRecord) {
  if (!payment.providerCheckoutId) return null;
  const response = await request(`checkout-sessions/${encodeURIComponent(payment.providerCheckoutId)}`);
  if (response.status === 404) throw new Error('Bachs checkout could not be found.');
  const parsed = sessionSchema.safeParse(await response.json());
  if (!response.ok || !parsed.success) throw new Error('Unable to verify Bachs payment.');
  const session = parsed.data;
  if (session.checkout_id !== payment.providerCheckoutId || session.reference !== payment.providerReference ||
      Number(session.amount) !== payment.amount || session.currency !== payment.currency ||
      payment.amount !== order.totalAmount || payment.currency !== order.currency ||
      session.customer?.email?.toLowerCase() !== order.shippingEmail.toLowerCase() || session.metadata.orderId !== order.id) {
    throw new Error('Payment details do not match the order.');
  }
  let status = 'pending';
  if (session.status === 'completed' && session.payment_status === 'succeeded' && session.charge?.status === 'succeeded') {
    if (Number(session.charge.amount) !== payment.amount || session.charge.currency !== payment.currency ||
        !session.charge.amount_paid || Number(session.charge.amount_paid) < payment.amount) throw new Error('Payment details do not match the order.');
    status = 'success';
  } else if (['expired', 'cancelled'].includes(session.status)) status = 'failed';
  // A failed charge can be retried inside an open session; keep that checkout active.
  return { status, paid_at: session.completed_at };
}

export function verifyBachsSignature(raw: string, headers: Headers, secret: string, now = Date.now()) {
  const timestamp = headers.get('x-bachs-timestamp') ?? '';
  const signature = headers.get('x-bachs-signature') ?? '';
  if (!/^\d+$/.test(timestamp) || Math.abs(now / 1000 - Number(timestamp)) > 300 || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${raw}`).digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
