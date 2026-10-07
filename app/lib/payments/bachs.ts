import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { log } from '@/app/lib/logger';
import { isTrustedCheckoutUrl } from './checkout-url';
import { PaymentError } from './payment-error';
import { redactProviderDetail } from './provider-error-detail';
import type {
  PaystackCheckoutInput,
  PaymentRecord,
  PreorderRecord,
} from '@/app/lib/types';

function configuration() {
  const secret = process.env.BACHS_API_KEY;
  if (!secret || !/^sk_(sandbox|live)_/.test(secret))
    throw new PaymentError(
      'BACHS_CONFIGURATION_MISSING',
      'BACHS_API_KEY must start with sk_sandbox_ or sk_live_.',
      { provider: 'bachs' },
    );
  return {
    secret,
    base: secret.startsWith('sk_sandbox_')
      ? 'https://sandbox-api.bachs.io'
      : 'https://api.bachs.io',
  };
}

async function request(path: string, init: RequestInit = {}) {
  const { secret, base } = configuration();
  try {
    return await fetch(`${base}/v1/${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    });
  } catch (cause) {
    const timeout =
      cause instanceof Error &&
      ['TimeoutError', 'AbortError'].includes(cause.name);
    throw new PaymentError(
      timeout ? 'BACHS_REQUEST_TIMEOUT' : 'BACHS_NETWORK_ERROR',
      timeout
        ? 'Bachs API request timed out after 15 seconds.'
        : 'Could not connect to the Bachs API; check server DNS and network access.',
      { provider: 'bachs' },
      cause,
    );
  }
}

async function responseBody(
  response: Response,
  sensitiveValues: string[] = [],
): Promise<unknown> {
  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new PaymentError(
      'BACHS_INVALID_JSON',
      'Bachs returned a response that is not valid JSON.',
      { provider: 'bachs', status: response.status },
      cause,
    );
  }
  if (!response.ok) {
    const error = z
      .object({
        detail: z.string().optional(),
        error_code: z
          .string()
          .regex(/^[A-Z][A-Z0-9_]{0,79}$/)
          .optional(),
        errors: z.array(z.object({ field: z.string() })).optional(),
      })
      .safeParse(body);
    const allowedFields = [
      'amount',
      'currency',
      'pricing',
      'pricing.amount',
      'pricing.currency',
      'reference',
      'customer',
      'customer.email',
      'customer.name',
      'success_url',
      'billing_currency',
      'payment_method_types',
      'metadata',
    ];
    const errorFields = error.success
      ? error.data.errors
          ?.map((item) => item.field)
          .filter((field) => allowedFields.includes(field))
      : undefined;
    const explanation =
      response.status === 401
        ? 'Bachs rejected the API key.'
        : response.status === 403
          ? 'Bachs denied access; check API key scopes and account payment permissions.'
          : response.status === 400
            ? 'Bachs rejected checkout parameters; check providerErrorCode and errorFields.'
            : response.status === 409
              ? 'Bachs reported a checkout reference or idempotency conflict.'
              : response.status === 429
                ? 'Bachs API rate limit exceeded.'
                : 'Bachs API returned an unsuccessful HTTP response.';
    throw new PaymentError('BACHS_HTTP_ERROR', explanation, {
      provider: 'bachs',
      status: response.status,
      providerErrorCode: error.success ? error.data.error_code : undefined,
      providerErrorMessage: error.success
        ? redactProviderDetail(error.data.detail, [
            ...sensitiveValues,
            process.env.BACHS_API_KEY ?? '',
            process.env.BACHS_WEBHOOK_SECRET ?? '',
          ])
        : undefined,
      errorFields,
    });
  }
  return body;
}

const checkoutSchema = z.object({
  checkout_id: z.string().min(1),
  reference: z.string(),
  checkout_url: z.url().refine((value) => isTrustedCheckoutUrl(value, 'bachs')),
});

export async function initializeBachs(
  input: PaystackCheckoutInput & { name: string },
) {
  const callback = process.env.BACHS_CALLBACK_URL;
  if (!callback)
    throw new PaymentError(
      'BACHS_CALLBACK_MISSING',
      'BACHS_CALLBACK_URL is not configured.',
      { provider: 'bachs' },
    );
  let successUrl: URL;
  try {
    successUrl = new URL(callback);
  } catch {
    throw new PaymentError(
      'BACHS_CALLBACK_INVALID',
      'BACHS_CALLBACK_URL must be an absolute HTTP or HTTPS URL.',
      { provider: 'bachs' },
    );
  }
  if (
    !['http:', 'https:'].includes(successUrl.protocol) ||
    successUrl.username ||
    successUrl.password
  )
    throw new PaymentError(
      'BACHS_CALLBACK_INVALID',
      'BACHS_CALLBACK_URL must use HTTP or HTTPS without embedded credentials.',
      { provider: 'bachs' },
    );
  successUrl.searchParams.set('reference', input.reference);
  const payload = {
    reference: input.reference,
    customer: { email: input.email, name: input.name },
    pricing: {
      amount: input.amount.toFixed(2),
      currency: 'NGN',
      price_type: 'fixed',
    },
    billing_currency: 'NGN',
    payment_method_types: ['NGN_CARD', 'NGN_BANK_TRANSFER'],
    success_url: successUrl.toString(),
    metadata: { orderId: input.orderId },
  };
  log('info', 'payment.checkout_requested', {
    provider: 'bachs',
    orderId: input.orderId,
    checkoutPayload: {
      ...payload,
      customer: { email: '[redacted]', name: '[redacted]' },
      success_url: `${successUrl.origin}${successUrl.pathname}`,
    },
  });
  const response = await request('checkout-sessions', {
    method: 'POST',
    headers: { 'Idempotency-Key': input.reference },
    body: JSON.stringify(payload),
  });
  const body = await responseBody(response, [
    input.email,
    input.name,
    input.reference,
    input.orderId,
  ]);
  let checkoutHost: string | undefined;
  if (
    body &&
    typeof body === 'object' &&
    'checkout_url' in body &&
    typeof body.checkout_url === 'string'
  ) {
    try {
      checkoutHost = new URL(body.checkout_url).hostname;
    } catch {
      /* Validation below reports malformed URLs. */
    }
  }
  log('info', 'payment.checkout_response', {
    provider: 'bachs',
    orderId: input.orderId,
    status: response.status,
    checkoutHost,
  });
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success)
    throw new PaymentError(
      'BACHS_CHECKOUT_RESPONSE_INVALID',
      'Bachs checkout response failed validation.',
      {
        provider: 'bachs',
        status: response.status,
        errorFields: parsed.error.issues.map((issue) => issue.path.join('.')),
      },
    );
  if (parsed.data.reference !== input.reference)
    throw new PaymentError(
      'BACHS_REFERENCE_MISMATCH',
      'Bachs returned a different checkout reference.',
      { provider: 'bachs' },
    );
  return {
    authorizationUrl: parsed.data.checkout_url,
    providerCheckoutId: parsed.data.checkout_id,
  };
}

const sessionSchema = z.object({
  checkout_id: z.string(),
  reference: z.string(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string(),
  status: z.enum(['open', 'completed', 'expired', 'cancelled']),
  payment_status: z.string().nullable().optional(),
  customer: z.object({ email: z.string().nullable() }).nullable(),
  completed_at: z.iso.datetime().nullable().optional(),
  metadata: z.object({ orderId: z.string() }),
  charge: z
    .object({
      status: z.string(),
      amount: z.string(),
      currency: z.string(),
      amount_paid: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export async function verifyBachs(
  payment: PaymentRecord,
  order: PreorderRecord,
) {
  if (!payment.providerCheckoutId) return null;
  const response = await request(
    `checkout-sessions/${encodeURIComponent(payment.providerCheckoutId)}`,
  );
  if (response.status === 404)
    throw new PaymentError(
      'BACHS_CHECKOUT_NOT_FOUND',
      'Stored Bachs checkout was not found; check whether the API key environment or account changed.',
      { provider: 'bachs', status: 404 },
    );
  const parsed = sessionSchema.safeParse(
    await responseBody(response, [
      order.shippingEmail,
      order.shippingFullName,
      order.shippingPhone ?? '',
      payment.providerReference,
      order.id,
    ]),
  );
  if (!parsed.success)
    throw new PaymentError(
      'BACHS_VERIFY_RESPONSE_INVALID',
      'Bachs verification response failed validation.',
      {
        provider: 'bachs',
        status: response.status,
        errorFields: parsed.error.issues.map((issue) => issue.path.join('.')),
      },
    );
  const session = parsed.data;
  if (
    session.checkout_id !== payment.providerCheckoutId ||
    session.reference !== payment.providerReference ||
    Number(session.amount) !== payment.amount ||
    session.currency !== payment.currency ||
    payment.amount !== order.totalAmount ||
    payment.currency !== order.currency ||
    session.customer?.email?.toLowerCase() !==
      order.shippingEmail.toLowerCase() ||
    session.metadata.orderId !== order.id
  ) {
    throw new PaymentError(
      'BACHS_PAYMENT_MISMATCH',
      'Bachs payment amount, currency, customer, reference or order metadata does not match the stored order.',
      { provider: 'bachs' },
    );
  }
  let status = 'pending';
  if (
    session.status === 'completed' &&
    session.payment_status === 'succeeded' &&
    session.charge?.status === 'succeeded'
  ) {
    if (
      Number(session.charge.amount) !== payment.amount ||
      session.charge.currency !== payment.currency ||
      !session.charge.amount_paid ||
      Number(session.charge.amount_paid) < payment.amount
    )
      throw new PaymentError(
        'BACHS_PAYMENT_MISMATCH',
        'Bachs payment amount, currency, customer, reference or order metadata does not match the stored order.',
        { provider: 'bachs' },
      );
    status = 'success';
  } else if (['expired', 'cancelled'].includes(session.status))
    status = 'failed';
  // A failed charge can be retried inside an open session; keep that checkout active.
  return { status, paid_at: session.completed_at };
}

export function verifyBachsSignature(
  raw: string,
  headers: Headers,
  secret: string,
  now = Date.now(),
) {
  const timestamp = headers.get('x-bachs-timestamp') ?? '';
  const signature = headers.get('x-bachs-signature') ?? '';
  if (
    !/^\d+$/.test(timestamp) ||
    Math.abs(now / 1000 - Number(timestamp)) > 300 ||
    !/^[a-f0-9]{64}$/i.test(signature)
  )
    return false;
  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${raw}`)
    .digest();
  return timingSafeEqual(expected, Buffer.from(signature, 'hex'));
}
