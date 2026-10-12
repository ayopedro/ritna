import { getPaymentResultUrl } from '@/app/lib/payments/callback-url';
import { logError } from '@/app/lib/logger';
import { withApi } from '@/app/lib/api/handler';
import { NextResponse } from 'next/server';
import { paymentReferenceSchema } from '@/app/lib/validators';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

async function handleGET(request: Request) {
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
  } catch (error) {
    logError('api.handled_error', error);
    // The result page can retry verification without treating a provider outage as failure.
  }
  const destination = getPaymentResultUrl(request, reference.data);
  return NextResponse.redirect(destination, 303);
}

export const GET = withApi('/api/payments/callback', handleGET, false);
