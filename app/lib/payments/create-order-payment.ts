import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { payments } from '@/app/lib/db/schema';
import type { PreorderRecord } from '@/app/lib/types';
import { verifyOrderPayment } from './verify-order-payment';
import { initializePaystack } from './paystack';
import { initializeBachs } from './bachs';

function configuredProvider() {
  const provider = process.env.PAYMENT_PROVIDER || 'paystack';
  if (provider !== 'paystack' && provider !== 'bachs') throw new Error('Invalid payment provider.');
  return provider;
}

async function initialize(provider: string, input: Parameters<typeof initializePaystack>[0] & { name: string }) {
  if (provider === 'bachs') return initializeBachs(input);
  if (provider === 'paystack') return { authorizationUrl: await initializePaystack(input) };
  throw new Error('Unknown payment provider.');
}

export async function createOrderPayment(order: PreorderRecord) {
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  let provider = configuredProvider();
  let attemptKey = order.idempotencyKey;
  let reference = `preorder-${order.id}`;
  if (existing) {
    provider = existing.provider;
    if (existing.status === 'succeeded')
      throw new Error('Payment already confirmed.');
    if (
      !existing.authorizationUrl &&
      Date.now() - existing.createdAt.getTime() < 30000
    ) {
      throw new Error('Payment initialization is in progress.');
    }
    const recovered = await verifyOrderPayment(existing.providerReference);
    if (recovered.providerStatus === 'success')
      throw new Error('Payment already confirmed.');
    if (recovered.providerStatus === 'failed') {
      attemptKey = existing.id;
      reference = `preorder-${randomUUID()}`;
    } else if (recovered.providerStatus === 'not_found') {
      const checkout = await initialize(provider, {
        email: order.shippingEmail,
        name: order.shippingFullName,
        amount: existing.amount,
        reference: existing.providerReference,
        orderId: order.id,
      });
      await db
        .update(payments)
        .set({ ...checkout, updatedAt: new Date() })
        .where(eq(payments.id, existing.id));
      return checkout.authorizationUrl;
    } else if (
      existing.authorizationUrl &&
      recovered.providerStatus !== 'reversed'
    ) {
      return existing.authorizationUrl;
    } else {
      throw new Error(
        'Payment exists at the provider but its checkout link could not be recovered.',
      );
    }
  }
  const [attempt] = await db
    .insert(payments)
    .values({
      orderId: order.id,
      provider,
      providerReference: reference,
      idempotencyKey: attemptKey,
      amount: order.totalAmount,
      currency: order.currency,
    })
    .onConflictDoNothing({ target: payments.idempotencyKey })
    .returning();
  if (!attempt)
    throw new Error('Payment initialization is already in progress.');
  const checkout = await initialize(provider, {
    email: order.shippingEmail,
    name: order.shippingFullName,
    amount: attempt.amount,
    reference: attempt.providerReference,
    orderId: order.id,
  });
  await db
    .update(payments)
    .set({ ...checkout, updatedAt: new Date() })
    .where(eq(payments.id, attempt.id));
  return checkout.authorizationUrl;
}
