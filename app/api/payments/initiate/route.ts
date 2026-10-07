import { logError } from '@/app/lib/logger';
import { withApi } from '@/app/lib/api/handler';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import * as z from 'zod';
import { db } from '@/app/lib/db';
import { orders } from '@/app/lib/db/schema';
import { initiatePaymentSchema } from '@/app/lib/validators';
import { createOrderPayment } from '@/app/lib/payments/create-order-payment';
import { isPaymentConfigured } from '@/app/lib/payments/configuration';

async function handlePOST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    logError('api.handled_error', error);
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }
  const parsed = initiatePaymentSchema.safeParse(body);
  const key = z.uuid().safeParse(request.headers.get('Idempotency-Key'));
  if (!parsed.success || !key.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          'An order ID and the original checkout Idempotency-Key are required.',
      },
      { status: 400 },
    );
  }
  if (!isPaymentConfigured()) {
    return NextResponse.json(
      { success: false, message: 'Payment service is not configured.' },
      { status: 503 },
    );
  }
  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.id, parsed.data.orderId),
          eq(orders.idempotencyKey, key.data),
        ),
      )
      .limit(1);
    if (!order)
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 },
      );
    if (order.status !== 'pending' || order.paymentStatus === 'succeeded') {
      return NextResponse.json(
        {
          success: false,
          message: 'This order is no longer awaiting payment.',
        },
        { status: 409 },
      );
    }
    const paymentUrl = await createOrderPayment(order);
    return NextResponse.json({
      success: true,
      data: { orderId: order.id, paymentUrl },
    });
  } catch (error) {
    logError('api.handled_error', error);
    return NextResponse.json(
      {
        success: false,
        message:
          'Payment could not be started. Check payment status before trying again.',
      },
      { status: 502 },
    );
  }
}

export const POST = withApi('/api/payments/initiate', handlePOST, false);
