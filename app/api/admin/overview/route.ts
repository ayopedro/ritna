import { withApi } from '@/app/lib/api/handler';
import { count } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { orders, reviews, waitlist } from '@/app/lib/db/schema';
import { NextResponse } from 'next/server';

export const GET = withApi('/api/admin/overview', async () => {
  const [[orderCount], [waitlistCount], [reviewCount]] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(waitlist),
    db.select({ value: count() }).from(reviews),
  ]);
  return NextResponse.json({ success: true, data: { orderCount: orderCount.value, waitlistCount: waitlistCount.value, reviewCount: reviewCount.value } });
}, true);
