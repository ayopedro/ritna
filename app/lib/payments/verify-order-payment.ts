import { withSpan } from '../telemetry/tracing';
import { log } from '@/app/lib/logger';
import { sendOrderConfirmation } from '@/app/lib/email/send-order-confirmation';
import { and, eq, ne } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { orders, payments } from '@/app/lib/db/schema';
import { getPaymentService } from './payment-service-factory';

export async function verifyOrderPayment(reference: string, provider?: string) {
  const [record] = await db
    .select({ payment: payments, order: orders })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(
      and(
        eq(payments.providerReference, reference),
        ...(provider ? [eq(payments.provider, provider)] : []),
      ),
    )
    .limit(1);
  if (!record) throw new Error('Unknown payment reference.');
  const service = getPaymentService(record.payment.provider);
  const verified = await service.verify(record.payment, record.order);
  if (!verified) return { ...record, providerStatus: 'not_found' as const };
  let confirmationEmailPending = false;
  if (verified.status === 'success') {
    await withSpan(
      'db.confirm_payment',
      { 'db.system.name': 'postgresql', 'db.operation.name': 'transaction' },
      () =>
        db.transaction(async (tx) => {
          await tx
            .update(payments)
            .set({
              status: 'succeeded',
              paidAt: verified.paid_at
                ? new Date(verified.paid_at)
                : new Date(),
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(payments.id, record.payment.id),
                ne(payments.status, 'succeeded'),
              ),
            );
          await tx
            .update(orders)
            .set({ paymentStatus: 'succeeded', updatedAt: new Date() })
            .where(
              and(
                eq(orders.id, record.order.id),
                ne(orders.paymentStatus, 'succeeded'),
              ),
            );
        }),
    );
    log('info', 'payment.verified', {
      orderId: record.order.id,
      paymentId: record.payment.id,
      provider: record.payment.provider,
    });
    try {
      await sendOrderConfirmation(record.order.id);
    } catch {
      confirmationEmailPending = true;
      log('warn', 'email.confirmation_pending', {
        orderId: record.order.id,
      });
    }
  }
  if (verified.status === 'failed') {
    await db
      .update(payments)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(
        and(
          eq(payments.id, record.payment.id),
          ne(payments.status, 'succeeded'),
        ),
      );
  }
  return {
    ...record,
    providerStatus: verified.status,
    confirmationEmailPending,
  };
}
