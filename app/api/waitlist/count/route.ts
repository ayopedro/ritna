import { db } from '@/app/lib/db';
import { waitlist } from '@/app/lib/db/schema';
import { count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const totalSubscribers = await db
    .select({ count: count() })
    .from(waitlist)
    .execute();

  return NextResponse.json(
    {
      success: true,
      data: { totalSubscribers: totalSubscribers[0].count },
      message: 'Total waitlist subscribers retrieved successfully.',
    },
    { status: 200 },
  );
}
