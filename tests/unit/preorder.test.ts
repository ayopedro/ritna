import { afterEach, expect, test } from 'bun:test';
import { createPreorderSchema } from '../../app/lib/validators';
import { initializePaystack } from '../../app/lib/payments/paystack';

const originalFetch = globalThis.fetch;
const originalSecret = process.env.PAYSTACK_SECRET_KEY;
afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalSecret === undefined) delete process.env.PAYSTACK_SECRET_KEY;
  else process.env.PAYSTACK_SECRET_KEY = originalSecret;
});
const input = {
  items: [{ id: '3514673a-4b58-5be3-a639-aab2f51d2c25', quantity: 2 }],
  customer: {
    fullName: 'Test Reader',
    email: 'reader@example.com',
    address: '1 Main Street',
    city: 'Lagos',
    state: 'Lagos',
    note: 'Call on arrival',
  },
};

test('rejects empty, duplicate, malformed and nonpositive cart items', () => {
  for (const items of [
    [],
    [input.items[0], input.items[0]],
    [{ ...input.items[0], id: 'bad' }],
    [{ ...input.items[0], quantity: 0 }],
    [{ ...input.items[0], quantity: -1 }],
    [{ ...input.items[0], quantity: 1.5 }],
  ]) {
    expect(createPreorderSchema.safeParse({ ...input, items }).success).toBe(
      false,
    );
  }
});

test('accepts checkout without a client total and preserves delivery notes', () => {
  expect(createPreorderSchema.parse(input).customer.note).toBe(
    'Call on arrival',
  );
  expect(
    createPreorderSchema.safeParse({
      ...input,
      customer: { ...input.customer, address: ' ' },
    }).success,
  ).toBe(false);
});

test('Paystack receives kobo and the stable reference', async () => {
  process.env.PAYSTACK_SECRET_KEY = 'test-only';
  globalThis.fetch = (async (
    _url: Parameters<typeof fetch>[0],
    options?: RequestInit,
  ) => {
    const body = JSON.parse(options?.body as string);
    expect(body.amount).toBe('7000000');
    expect(body.reference).toBe('preorder-test');
    expect(body.currency).toBe('NGN');
    return Response.json({
      status: true,
      data: {
        reference: body.reference,
        authorization_url: 'https://checkout.paystack.com/test',
      },
    });
  }) as unknown as typeof fetch;
  expect(
    await initializePaystack({
      email: 'reader@example.com',
      amount: 70000,
      reference: 'preorder-test',
      orderId: 'test',
    }),
  ).toBe('https://checkout.paystack.com/test');
});

test('rejects provider errors and mismatched references', async () => {
  process.env.PAYSTACK_SECRET_KEY = 'test-only';
  for (const response of [
    { status: false },
    {
      status: true,
      data: {
        reference: 'wrong',
        authorization_url: 'https://checkout.paystack.com/test',
      },
    },
  ]) {
    globalThis.fetch = (async () =>
      Response.json(response)) as unknown as typeof fetch;
    await expect(
      initializePaystack({
        email: 'reader@example.com',
        amount: 35000,
        reference: 'expected',
        orderId: 'test',
      }),
    ).rejects.toThrow();
  }
});

test('verifies reference with Paystack and rejects transient errors', async () => {
  const { verifyPaystack } = await import('../../app/lib/payments/paystack');
  process.env.PAYSTACK_SECRET_KEY = 'test-only';
  const data = {
    reference: 'preorder-test',
    status: 'success',
    amount: 3500000,
    currency: 'NGN',
    customer: { email: 'reader@example.com' },
    paid_at: '2026-09-30T10:00:00.000Z',
  };
  globalThis.fetch = (async () =>
    Response.json({ status: true, data })) as unknown as typeof fetch;
  expect((await verifyPaystack('preorder-test'))?.status).toBe('success');
  await expect(verifyPaystack('wrong-reference')).rejects.toThrow();
  globalThis.fetch = (async () =>
    Response.json(
      { status: false },
      { status: 503 },
    )) as unknown as typeof fetch;
  await expect(verifyPaystack('preorder-test')).rejects.toThrow();
  globalThis.fetch = (async () =>
    Response.json(
      { status: false },
      { status: 404 },
    )) as unknown as typeof fetch;
  expect(await verifyPaystack('preorder-test')).toBeNull();
});

test('payment matching rejects incorrect amounts, currencies and customers', async () => {
  const { validatePaymentMatch } =
    await import('../../app/lib/payments/paystack');
  const payment = {
    providerReference: 'test',
    amount: 35000,
    currency: 'NGN',
  } as import('../../app/lib/types').PaymentRecord;
  const order = {
    totalAmount: 35000,
    currency: 'NGN',
    shippingEmail: 'reader@example.com',
  } as import('../../app/lib/types').PreorderRecord;
  const verified = {
    reference: 'test',
    amount: 3500000,
    currency: 'NGN',
    customer: { email: 'reader@example.com' },
    status: 'success' as const,
  };
  expect(() => validatePaymentMatch(payment, order, verified)).not.toThrow();
  for (const change of [
    { amount: 1 },
    { currency: 'USD' },
    { reference: 'another' },
    { customer: { email: 'someone@example.com' } },
  ]) {
    expect(() =>
      validatePaymentMatch(payment, order, { ...verified, ...change }),
    ).toThrow();
  }
});

test('payment retry accepts an order id without trusting a client amount', async () => {
  const { initiatePaymentSchema } = await import('../../app/lib/validators');
  const data = initiatePaymentSchema.parse({
    orderId: input.items[0].id,
    amount: 1,
    customerEmail: 'attacker@example.com',
  });
  expect(data).toEqual({ orderId: input.items[0].id });
});

test('checkout only accepts a valid Paystack redirect', async () => {
  const { preorderCheckoutResponseSchema } =
    await import('../../app/lib/validators');
  const response = {
    success: true,
    data: {
      orderId: input.items[0].id,
      paymentUrl: 'https://checkout.paystack.com/test',
    },
  };
  expect(preorderCheckoutResponseSchema.safeParse(response).success).toBe(true);
  expect(
    preorderCheckoutResponseSchema.safeParse({
      ...response,
      data: { ...response.data, paymentUrl: 'https://example.com' },
    }).success,
  ).toBe(false);
});
