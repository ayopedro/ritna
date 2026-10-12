import type {
  ConfirmationEmailItem,
  ConfirmationEmailPayload,
  PreorderRecord,
} from '@/app/lib/types';
import { RESEND_EMAIL_URL } from '@/app/lib/constants';

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      })[character]!,
  );

export function buildConfirmationEmail(
  order: PreorderRecord,
  items: ConfirmationEmailItem[],
  from: string,
  support: string,
): ConfirmationEmailPayload {
  const money = (amount: number) => `NGN ${amount.toLocaleString('en-NG')}`;
  const address = [
    order.shippingFullName,
    order.shippingAddressLine1,
    order.shippingAddressLine2,
    `${order.shippingCity}, ${order.shippingState}`,
  ].filter(Boolean) as string[];
  const itemRows = items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827">${escapeHtml(item.title)} × ${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827">${escapeHtml(money(item.unitPrice * item.quantity))}</td>
      </tr>`,
    )
    .join('');
  return {
    from,
    to: [order.shippingEmail],
    reply_to: support,
    subject: `Your RITNA preorder ${order.reference} is confirmed`,
    text: [
      `Hello ${order.shippingFullName},`,
      '',
      'Your payment is confirmed. Thank you for preordering RITNA.',
      `Order reference: ${order.reference}`,
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
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#111827">
    <div style="max-width:600px;margin:0 auto;padding:32px 16px">
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:32px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.14em;color:#2563eb">RITNA</p>
        <h1 style="margin:0 0 20px;font-size:24px;line-height:1.3">Preorder confirmed</h1>
        <p style="margin:0 0 12px;line-height:1.6">Hello ${escapeHtml(order.shippingFullName)},</p>
        <p style="margin:0 0 24px;line-height:1.6;color:#4b5563">Your payment is confirmed. Thank you for preordering RITNA.</p>
        <table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">${itemRows}</table>
        <p style="margin:20px 0 4px;font-size:14px;color:#4b5563">Amount paid</p>
        <p style="margin:0 0 24px;font-size:20px;font-weight:700">${escapeHtml(money(order.totalAmount))}</p>
        <p style="margin:0 0 6px;font-size:14px;font-weight:700">Delivery address</p>
        <p style="margin:0 0 24px;line-height:1.6;color:#4b5563">${address.map(escapeHtml).join('<br>')}</p>
        <p style="margin:0 0 6px;font-size:12px;color:#6b7280">Order reference</p>
        <p style="margin:0;font-family:monospace;font-size:12px;word-break:break-all;color:#374151">${escapeHtml(order.reference)}</p>
      </div>
      <p style="margin:16px 0 0;text-align:center;font-size:12px;color:#6b7280">Need help? Reply to this email or contact <a href="mailto:${escapeHtml(support)}" style="color:#2563eb">${escapeHtml(support)}</a>.</p>
    </div>
  </body>
</html>`,
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
