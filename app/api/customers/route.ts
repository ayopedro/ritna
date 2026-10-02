import { withApi } from '@/app/lib/api/handler';
import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { customers } from '@/app/lib/db/schema';
import { CustomerInsertSchema } from '@/app/lib/validators';
import { desc } from 'drizzle-orm';

async function handleGET() {
  const data = await db.select().from(customers).orderBy(desc(customers.createdAt)).limit(100);
  return NextResponse.json({ success: true, data });
}

async function handlePOST(request: Request) {
  const parsed = CustomerInsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ success: false, message: 'Invalid customer details.' }, { status: 400 });
  const [customer] = await db.insert(customers).values(parsed.data)
    .onConflictDoNothing({ target: customers.email }).returning({ id: customers.id });
  if (!customer) return NextResponse.json({ success: false, message: 'A customer with this email already exists.' }, { status: 409 });
  return NextResponse.json({ success: true, data: customer }, { status: 201 });
}

export const GET = withApi('/api/customers', handleGET, true);

export const POST = withApi('/api/customers', handlePOST, true);
