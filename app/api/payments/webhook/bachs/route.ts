import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { payments } from '@/app/lib/db/schema';
import { logError } from '@/app/lib/logger';
import { verifyBachsSignature } from '@/app/lib/payments/bachs';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

const eventSchema = z.object({ type: z.string(), data: z.object({ reference: z.string().nullable().optional() }) });
async function handlePOST(request: Request) {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return new NextResponse(null, { status: 503 });
  const raw = await request.text();
  if (!verifyBachsSignature(raw, request.headers, secret)) return new NextResponse(null, { status: 401 });
  let event;
  try { event = eventSchema.safeParse(JSON.parse(raw)); }
  catch { return new NextResponse(null, { status: 400 }); }
  if (!event.success) return new NextResponse(null, { status: 400 });
  if (!['collection.succeeded', 'checkout.completed'].includes(event.data.type)) return NextResponse.json({ received: true });
  const reference = event.data.data.reference;
  if (!reference?.startsWith('preorder-')) return NextResponse.json({ received: true });
  try {
    const [record] = await db.select({ id: payments.id }).from(payments)
      .where(and(eq(payments.providerReference, reference), eq(payments.provider, 'bachs'))).limit(1);
    if (!record) return NextResponse.json({ received: true });
    const result = await verifyOrderPayment(reference, 'bachs');
    if (result.providerStatus !== 'success' || result.confirmationEmailPending) return new NextResponse(null, { status: 503 });
    return NextResponse.json({ received: true });
  } catch (error) {
    logError('api.handled_error', error);
    return new NextResponse(null, { status: 503 });
  }
}
export const POST = withApi('/api/payments/webhook/bachs', handlePOST, false);
