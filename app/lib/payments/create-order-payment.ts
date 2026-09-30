import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { payments } from '@/app/lib/db/schema';
import type { PreorderRecord } from '@/app/lib/types';
import { verifyOrderPayment } from './verify-order-payment';
import { initializePaystack } from './paystack';

export async function createOrderPayment(order: PreorderRecord) {
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  let attemptKey = order.idempotencyKey;
  let reference = `preorder-${order.id}`;
  if (existing) {
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
      const url = await initializePaystack({
        email: order.shippingEmail,
        amount: existing.amount,
        reference: existing.providerReference,
        orderId: order.id,
      });
      await db
        .update(payments)
        .set({ authorizationUrl: url, updatedAt: new Date() })
        .where(eq(payments.id, existing.id));
      return url;
    } else if (
      existing.authorizationUrl &&
      recovered.providerStatus !== 'reversed'
    ) {
      return existing.authorizationUrl;
    } else {
      throw new Error(
        'Payment exists at Paystack but its checkout link could not be recovered.',
      );
    }
  }
  const [attempt] = await db
    .insert(payments)
    .values({
      orderId: order.id,
      provider: 'paystack',
      providerReference: reference,
      idempotencyKey: attemptKey,
      amount: order.totalAmount,
      currency: order.currency,
    })
    .onConflictDoNothing({ target: payments.idempotencyKey })
    .returning();
  if (!attempt)
    throw new Error('Payment initialization is already in progress.');
  const authorizationUrl = await initializePaystack({
    email: order.shippingEmail,
    amount: attempt.amount,
    reference: attempt.providerReference,
    orderId: order.id,
  });
  await db
    .update(payments)
    .set({ authorizationUrl, updatedAt: new Date() })
    .where(eq(payments.id, attempt.id));
  return authorizationUrl;
}
