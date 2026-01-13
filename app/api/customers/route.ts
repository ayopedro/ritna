import { NextResponse as Response } from 'next/server';
import { db } from '@/app/lib/db';
import { customers } from '@/app/lib/db/schema';
import { CustomerInsertSchema } from '@/app/lib/validator';
import AppUtils from '@/app/lib/utils';
import { eq } from 'drizzle-orm';

export async function GET() {
  const allCustomers = await db.select().from(customers);

  return Response.json({ message: 'Hello Customers!', data: allCustomers });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { success, data, error } = CustomerInsertSchema.safeParse(body);
    if (!success) {
      return Response.json(
        {
          ok: false,
          message: 'Validation error',
          error: AppUtils.formatZodError(error),
        },
        { status: 400 }
      );
    }
    const existingCustomer = await db
      .select()
      .from(customers)
      .where(eq(customers.email, data.email))
      .limit(1);
      
    if (existingCustomer.length) {
      return Response.json(
        { ok: false, message: 'A customer with this email already exists' },
        { status: 409 }
      );
    }

    const newCustomer = await db.insert(customers).values(data).returning({
      id: customers.id,
    });

    return Response.json({ ok: true, message: 'Customer created', data: newCustomer });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return Response.json(
      {
        ok: false,
        message: 'Error creating customer',
        error: error?.cause?.detail || error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
