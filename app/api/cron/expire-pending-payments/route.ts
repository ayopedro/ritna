import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { withApi } from '@/app/lib/api/handler';
import { expirePendingPayments } from '@/app/lib/payments/expire-pending-payments';

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const token = request.headers.get('authorization');
  const expected = `Bearer ${secret}`;
  if (!token || token.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export const GET = withApi('/api/cron/expire-pending-payments', async (request) => {
  if (!process.env.CRON_SECRET)
    return NextResponse.json(
      { success: false, message: 'Cron is not configured.' },
      { status: 503 },
    );
  if (!isAuthorized(request))
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  const result = await expirePendingPayments();
  return NextResponse.json({ success: true, data: result });
});
