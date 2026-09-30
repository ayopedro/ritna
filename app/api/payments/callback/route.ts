import { NextResponse } from 'next/server';
import { paymentReferenceSchema } from '@/app/lib/validators';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

export async function GET(request: Request) {
  const reference = paymentReferenceSchema.safeParse(
    new URL(request.url).searchParams.get('reference'),
  );
  if (!reference.success)
    return NextResponse.json(
      { success: false, message: 'Invalid payment reference.' },
      { status: 400 },
    );
  try {
    await verifyOrderPayment(reference.data);
  } catch {
    // The result page can retry verification without treating a provider outage as failure.
  }
  const destination = new URL('/preorder/payment', request.url);
  destination.searchParams.set('reference', reference.data);
  return NextResponse.redirect(destination, 303);
}
