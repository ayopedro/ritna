import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { paymentReferenceSchema } from '@/app/lib/validators';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

export async function POST(request: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return new NextResponse(null, { status: 503 });
  const raw = await request.text();
  const signature = request.headers.get('x-paystack-signature') ?? '';
  if (!/^[a-f0-9]{128}$/i.test(signature))
    return new NextResponse(null, { status: 401 });
  const expected = createHmac('sha512', secret).update(raw).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, 'hex')))
    return new NextResponse(null, { status: 401 });
  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  if (event.event !== 'charge.success')
    return NextResponse.json({ received: true });
  const reference = paymentReferenceSchema.safeParse(event.data?.reference);
  if (!reference.success) return new NextResponse(null, { status: 400 });
  if (!reference.data.startsWith('preorder-'))
    return NextResponse.json({ received: true });
  try {
    const result = await verifyOrderPayment(reference.data);
    if (result.providerStatus !== 'success' || result.confirmationEmailPending)
      return new NextResponse(null, { status: 503 });
    return NextResponse.json({ received: true });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
