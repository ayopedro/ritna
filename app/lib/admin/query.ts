import { and, asc, desc, ilike, or, sql } from 'drizzle-orm';
import { customers, orders, waitlist } from '@/app/lib/db/schema';
import type { AdminRecordsQuery } from '@/app/lib/types';

export function adminRecordQuery(query: AdminRecordsQuery) {
  const pattern = `%${query.search.replace(/[\\%_]/g, '\\$&')}%`;
  const name = query.kind === 'orders'
    ? sql<string>`concat_ws(' ', ${customers.firstName}, ${customers.lastName})`
    : sql<string>`concat_ws(' ', ${waitlist.firstName}, ${waitlist.lastName})`;
  const payment = sql<string>`case when ${orders.paymentStatus} = 'succeeded' then 'Paid' else ${orders.paymentStatus}::text end`;
  const orderColumns = { id: orders.id, customer: name, email: customers.email, status: orders.status, payment, createdAt: orders.createdAt };
  const waitlistColumns = { name, email: waitlist.email, phone: waitlist.phone, category: waitlist.category, createdAt: waitlist.createdAt };
  const columns = query.kind === 'orders' ? orderColumns : waitlistColumns;
  const sortColumn = columns[query.sort as keyof typeof columns] ?? columns.createdAt;
  const where = !query.search ? undefined : query.kind === 'orders'
    ? or(ilike(sql`${orders.id}::text`, pattern), ilike(name, pattern), ilike(customers.email, pattern), ilike(sql`${orders.status}::text`, pattern), ilike(payment, pattern))
    : or(ilike(name, pattern), ilike(waitlist.email, pattern), ilike(waitlist.phone, pattern), ilike(sql`${waitlist.category}::text`, pattern));
  const direction = query.direction === 'asc' ? asc : desc;
  return { where: and(where), orderBy: [direction(sortColumn), asc(query.kind === 'orders' ? orders.id : waitlist.id)] };
}
