import type { PaymentResultPageProps } from '@/app/lib/types';
import Link from 'next/link';
import { paymentReferenceSchema } from '@/app/lib/validators';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

export const dynamic = 'force-dynamic';

export default async function PaymentResult({
  searchParams,
}: PaymentResultPageProps) {
  const reference = paymentReferenceSchema.safeParse(
    (await searchParams).reference,
  );
  let message =
    'We could not verify your payment. Refresh this page to check again. Please do not pay again while confirmation is pending.';
  let paid = false;
  if (reference.success) {
    try {
      const result = await verifyOrderPayment(reference.data);
      paid = result.providerStatus === 'success';
      if (paid)
        message = 'Your payment is confirmed. Thank you for your preorder.';
      else if (result.providerStatus === 'failed')
        message =
          'Paystack reports that this payment failed. Contact us with the reference below for help retrying.';
      else if (result.providerStatus === 'reversed')
        message =
          'This payment has been reversed. Contact us with the reference below.';
    } catch {}
  }
  return (
    <main className='mx-auto max-w-xl px-6 py-20'>
      <h1 className='mb-4 text-2xl font-semibold'>
        {paid ? 'Payment confirmed' : 'Payment status'}
      </h1>
      <p>{message}</p>
      {reference.success && (
        <p className='mt-4 break-all text-sm'>Reference: {reference.data}</p>
      )}
      <Link href='/preorder' className='mt-8 inline-block underline'>
        Back to preorder
      </Link>
    </main>
  );
}
