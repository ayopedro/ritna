import { NextResponse as Response } from 'next/server';
import { db } from '@/app/lib/db';
import { customers } from '@/app/lib/db/schema';
import { CustomerInsertSchema } from '@/app/lib/validator';
import AppUtils from '@/app/lib/utils';

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
          message: 'Validation error',
          error: AppUtils.formatZodError(error),
        },
        { status: 400 }
      );
    }
    const newCustomer = await db.insert(customers).values(data).returning({
      id: customers.id,
    });

    return Response.json({ message: 'Customer created', data: newCustomer });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error(error);
    return Response.json(
      {
        message: 'Error creating customer',
        error: error?.cause?.detail || error?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
