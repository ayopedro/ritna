import { db } from '@/app/lib/db';
import { waitlist } from '@/app/lib/db/schema';
import { waitlistSchema } from '@/app/lib/validators';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const {
    success,
    error,
    data: validatedFields,
  } = waitlistSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        errors: error.flatten().fieldErrors,
        message: 'Validation failed.',
      },
      { status: 400 },
    );
  }

  const { email, firstName, lastName, category } = validatedFields!;

  const isExisting = await db
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, email))
    .limit(1);

  if (isExisting.length) {
    return NextResponse.json(
      {
        success: false,
        errors: { email: ['This email is already on the waitlist.'] },
        message: 'You are already on the waitlist.',
      },
      { status: 409 },
    );
  }

  await db.insert(waitlist).values({ email, firstName, lastName, category });

  return NextResponse.json(
    {
      success: true,
      errors: {},
      message: 'Successfully joined the waitlist!',
    },
    { status: 201 },
  );
}
