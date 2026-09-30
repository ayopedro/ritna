import { eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import {
  books,
  orders,
  orderItems,
  orderConfirmationEmails,
} from '@/app/lib/db/schema';
import { EMAIL_RETRY_WINDOW_MS } from '@/app/lib/constants';
import { buildConfirmationEmail, sendConfirmationEmail } from './confirmation';

export async function sendOrderConfirmation(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order || order.paymentStatus !== 'succeeded')
    throw new Error('Order payment is not confirmed.');
  let [email] = await db
    .select()
    .from(orderConfirmationEmails)
    .where(eq(orderConfirmationEmails.orderId, orderId))
    .limit(1);
  if (email?.sentAt) return;
  if (!email) {
    const from = process.env.ORDER_EMAIL_FROM;
    const support = process.env.ORDER_SUPPORT_EMAIL;
    if (!from || !support || !process.env.RESEND_API_KEY)
      throw new Error('Order email configuration is incomplete.');
    const items = await db
      .select({
        title: books.title,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
      })
      .from(orderItems)
      .innerJoin(books, eq(orderItems.bookId, books.id))
      .where(eq(orderItems.orderId, orderId))
      .orderBy(orderItems.id);
    const payload = buildConfirmationEmail(order, items, from, support);
    await db
      .insert(orderConfirmationEmails)
      .values({ orderId, payload })
      .onConflictDoNothing();
    [email] = await db
      .select()
      .from(orderConfirmationEmails)
      .where(eq(orderConfirmationEmails.orderId, orderId))
      .limit(1);
  }
  if (email.sentAt) return;
  if (Date.now() - email.createdAt.getTime() > EMAIL_RETRY_WINDOW_MS) {
    throw new Error(
      'Email requires provider reconciliation before retrying outside the idempotency window.',
    );
  }
  const providerId = await sendConfirmationEmail(email.payload, orderId);
  await db
    .update(orderConfirmationEmails)
    .set({ providerId, sentAt: new Date() })
    .where(eq(orderConfirmationEmails.orderId, orderId));
}
