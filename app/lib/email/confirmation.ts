import type {
  ConfirmationEmailItem,
  ConfirmationEmailPayload,
  PreorderRecord,
} from '@/app/lib/types';
import { RESEND_EMAIL_URL } from '@/app/lib/constants';

export function buildConfirmationEmail(
  order: PreorderRecord,
  items: ConfirmationEmailItem[],
  from: string,
  support: string,
): ConfirmationEmailPayload {
  const money = (amount: number) => `NGN ${amount.toLocaleString('en-NG')}`;
  return {
    from,
    to: [order.shippingEmail],
    reply_to: support,
    subject: 'Your RITNA preorder is confirmed',
    text: [
      `Hello ${order.shippingFullName},`,
      '',
      'Your payment is confirmed. Thank you for preordering RITNA.',
      `Order reference: ${order.id}`,
      '',
      ...items.map(
        (item) =>
          `${item.title} × ${item.quantity} — ${money(item.unitPrice * item.quantity)}`,
      ),
      '',
      `Amount paid: ${money(order.totalAmount)}`,
      '',
      'Delivery address:',
      order.shippingFullName,
      order.shippingAddressLine1,
      order.shippingAddressLine2,
      `${order.shippingCity}, ${order.shippingState}`,
      '',
      `For help with your order, reply to this email or contact ${support}.`,
    ]
      .filter((line) => line !== null && line !== undefined)
      .join('\n'),
  };
}

export async function sendConfirmationEmail(
  payload: ConfirmationEmailPayload,
  orderId: string,
) {
  if (!process.env.RESEND_API_KEY)
    throw new Error('Email service is not configured.');
  const response = await fetch(RESEND_EMAIL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `preorder-confirmation/${orderId}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok || typeof result.id !== 'string')
    throw new Error('Confirmation email was not accepted.');
  return result.id;
}
