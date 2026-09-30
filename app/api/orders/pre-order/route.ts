import { createPreorder } from '@/app/lib/orders/create-preorder';
import { createOrderPayment } from '@/app/lib/payments/create-order-payment';
import { createPreorderSchema } from '@/app/lib/validators';
import { NextResponse } from 'next/server';
import * as z from 'zod';

export async function POST(request: Request) {
  const key = z.uuid().safeParse(request.headers.get('Idempotency-Key'));
  if (!key.success) {
    return NextResponse.json(
      { success: false, message: 'A UUID Idempotency-Key header is required.' },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON body.' },
      { status: 400 },
    );
  }
  const parsed = createPreorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: 'Validation failed.',
        errors: z.treeifyError(parsed.error),
      },
      { status: 400 },
    );
  }

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json(
      { success: false, message: 'Payment service is not configured.' },
      { status: 503 },
    );
  }

  try {
    const result = await createPreorder(parsed.data, key.data);
    if ('error' in result) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: result.status },
      );
    }
    if (
      result.order.paymentStatus === 'succeeded' ||
      result.order.status !== 'pending'
    ) {
      return NextResponse.json(
        {
          success: false,
          message: 'This order is no longer awaiting payment.',
        },
        { status: 409 },
      );
    }
    let paymentUrl: string;
    try {
      paymentUrl = await createOrderPayment(result.order);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            'Your order was saved, but its payment link is not available yet. Retry shortly; if this persists, contact support with your order ID.',
          data: { orderId: result.order.id },
        },
        { status: 502 },
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: 'Preorder created. Continue to Paystack to pay.',
        data: {
          orderId: result.order.id,
          paymentUrl,
          totalAmount: result.order.totalAmount,
          currency: result.order.currency,
          paymentStatus: result.order.paymentStatus,
        },
      },
      { status: result.status },
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        message:
          'Unable to create preorder. Retry with the same idempotency key.',
      },
      { status: 500 },
    );
  }
}
