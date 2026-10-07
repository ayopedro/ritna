import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { payments } from '@/app/lib/db/schema';
import type { PreorderRecord } from '@/app/lib/types';
import { verifyOrderPayment } from './verify-order-payment';
import { getPaymentService } from './payment-service-factory';
import type { PaymentService } from './payment-service';
import { PaymentError } from './payment-error';
import { configuredProvider } from './configuration';

export async function createOrderPayment(
  order: PreorderRecord,
  paymentService?: PaymentService,
) {
  const [existing] = await db
    .select()
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  const service = existing
    ? getPaymentService(existing.provider)
    : (paymentService ?? getPaymentService(configuredProvider()));
  const provider = service.provider;
  let attemptKey = order.idempotencyKey;
  let reference = `preorder-${order.reference}`;
  if (existing) {
    if (existing.status === 'succeeded')
      throw new Error('Payment already confirmed.');
    if (
      !existing.authorizationUrl &&
      Date.now() - existing.createdAt.getTime() < 30000
    ) {
      throw new PaymentError(
        'PAYMENT_INITIALIZATION_IN_PROGRESS',
        'Payment initialization is in progress; retry after 30 seconds.',
        { provider },
      );
    }
    const recovered = await verifyOrderPayment(existing.providerReference);
    if (recovered.providerStatus === 'success')
      throw new Error('Payment already confirmed.');
    if (recovered.providerStatus === 'failed') {
      attemptKey = existing.id;
      reference = `preorder-${order.reference}-${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    } else if (recovered.providerStatus === 'not_found') {
      const checkout = await service.initialize({
        email: order.shippingEmail,
        name: order.shippingFullName,
        amount: existing.amount,
        currency: existing.currency,
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
    throw new PaymentError(
      'PAYMENT_INITIALIZATION_CONFLICT',
      'Another request already created this payment attempt; retry with the same checkout key.',
      { provider },
    );
  const checkout = await service.initialize({
    email: order.shippingEmail,
    name: order.shippingFullName,
    amount: attempt.amount,
    currency: attempt.currency,
    reference: attempt.providerReference,
    orderId: order.id,
  });
  await db
    .update(payments)
    .set({ ...checkout, updatedAt: new Date() })
    .where(eq(payments.id, attempt.id));
  return checkout.authorizationUrl;
}
