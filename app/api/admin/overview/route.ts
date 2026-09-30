import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { customers, orders, reviews, waitlist } from '@/app/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const [
    [orderCount],
    [waitlistCount],
    [reviewCount],
    orderRows,
    waitlistRows,
  ] = await Promise.all([
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(waitlist),
    db.select({ value: count() }).from(reviews),
    db
      .select({
        id: orders.id,
        status: orders.status,
        createdAt: orders.createdAt,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt))
      .limit(100),
    db
      .select({
        id: waitlist.id,
        firstName: waitlist.firstName,
        lastName: waitlist.lastName,
        email: waitlist.email,
        phone: waitlist.phone,
        category: waitlist.category,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt))
      .limit(100),
  ]);

  const data = {
    orderCount: orderCount.value,
    waitlistCount: waitlistCount.value,
    reviewCount: reviewCount.value,
    orderRows,
    waitlistRows,
  }

  return NextResponse.json({ data });
}
