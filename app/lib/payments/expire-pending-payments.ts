import { and, count, eq, lt } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { orders, payments } from '@/app/lib/db/schema';
import { logError } from '@/app/lib/logger';
import { verifyOrderPayment } from './verify-order-payment';

const DEFAULT_PENDING_PAYMENT_EXPIRY_HOURS = 24;

export function pendingPaymentExpiryHours() {
  const configured = process.env.PENDING_PAYMENT_EXPIRY_HOURS;
  if (!configured) return DEFAULT_PENDING_PAYMENT_EXPIRY_HOURS;
  const hours = Number(configured);
  if (!Number.isInteger(hours) || hours < 1 || hours > 168)
    throw new Error(
      'PENDING_PAYMENT_EXPIRY_HOURS must be an integer between 1 and 168.',
    );
  return hours;
}

async function cancelOrderWithoutPendingPayments(orderId: string) {
  const [{ value: pendingPaymentCount }] = await db
    .select({ value: count() })
    .from(payments)
    .where(and(eq(payments.orderId, orderId), eq(payments.status, 'pending')));
  if (pendingPaymentCount) return false;
  const [order] = await db
    .update(orders)
    .set({
      status: 'canceled',
      paymentStatus: 'failed',
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(orders.id, orderId),
        eq(orders.status, 'pending'),
        eq(orders.paymentStatus, 'pending'),
      ),
    )
    .returning({ id: orders.id });
  return Boolean(order);
}

async function expirePayment(paymentId: string, orderId: string, cutoff: Date) {
  const [payment] = await db
    .update(payments)
    .set({ status: 'failed', updatedAt: new Date() })
    .where(
      and(
        eq(payments.id, paymentId),
        eq(payments.status, 'pending'),
        lt(payments.createdAt, cutoff),
      ),
    )
    .returning({ id: payments.id });
  if (!payment) return false;
  await cancelOrderWithoutPendingPayments(orderId);
  return true;
}

export async function expirePendingPayments(now = new Date()) {
  const cutoff = new Date(
    now.getTime() - pendingPaymentExpiryHours() * 60 * 60 * 1000,
  );
  const candidates = await db
    .select({
      paymentId: payments.id,
      orderId: orders.id,
      reference: payments.providerReference,
      provider: payments.provider,
    })
    .from(payments)
    .innerJoin(orders, eq(payments.orderId, orders.id))
    .where(
      and(
        eq(payments.status, 'pending'),
        eq(orders.status, 'pending'),
        eq(orders.paymentStatus, 'pending'),
        lt(payments.createdAt, cutoff),
      ),
    );

  let expired = 0;
  let errors = 0;
  for (const candidate of candidates) {
    try {
      const verified = await verifyOrderPayment(
        candidate.reference,
        candidate.provider,
      );
      if (verified.providerStatus === 'success') continue;
      if (verified.providerStatus === 'failed') {
        if (await cancelOrderWithoutPendingPayments(candidate.orderId)) expired++;
        continue;
      }
      if (await expirePayment(candidate.paymentId, candidate.orderId, cutoff))
        expired++;
    } catch (error) {
      errors++;
      logError('payment.expiry_verification_failed', error, {
        orderId: candidate.orderId,
        paymentId: candidate.paymentId,
        provider: candidate.provider,
      });
    }
  }
  return { candidates: candidates.length, expired, errors };
}
