import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { customers, orders, waitlist } from '@/app/lib/db/schema';
import { adminRecordsQuerySchema } from '@/app/lib/validators';
import { adminRecordQuery } from '@/app/lib/admin/query';

export const GET = withApi('/api/admin/records', async (request) => {
  const parsed = adminRecordsQuerySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid table query.' }, { status: 400 });
  const query = parsed.data;
  const { where, orderBy } = adminRecordQuery(query);
  const result = await db.transaction(async (tx) => {
    const [total] = query.kind === 'orders'
      ? await tx.select({ value: count() }).from(orders).innerJoin(customers, eq(orders.customerId, customers.id)).where(where)
      : await tx.select({ value: count() }).from(waitlist).where(where);
    const page = Math.min(query.page, Math.max(0, Math.ceil(total.value / query.pageSize) - 1));
    const rows = query.kind === 'orders'
      ? await tx.select({ id: orders.id, status: orders.status, paymentStatus: orders.paymentStatus, createdAt: orders.createdAt, firstName: customers.firstName, lastName: customers.lastName, email: customers.email })
        .from(orders).innerJoin(customers, eq(orders.customerId, customers.id)).where(where).orderBy(...orderBy).limit(query.pageSize).offset(page * query.pageSize)
      : await tx.select({ id: waitlist.id, firstName: waitlist.firstName, lastName: waitlist.lastName, email: waitlist.email, phone: waitlist.phone, category: waitlist.category, createdAt: waitlist.createdAt })
        .from(waitlist).where(where).orderBy(...orderBy).limit(query.pageSize).offset(page * query.pageSize);
    return { rows, totalCount: total.value, page, pageSize: query.pageSize };
  }, { isolationLevel: 'repeatable read', accessMode: 'read only' });
  return NextResponse.json({ success: true, data: result });
}, true);
