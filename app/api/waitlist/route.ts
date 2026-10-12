import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { waitlist } from '@/app/lib/db/schema';
import { waitlistSchema } from '@/app/lib/validators';
import * as z from 'zod';
import { NextResponse } from 'next/server';

async function handlePOST(request: Request) {
  const body = await request.json().catch(() => null);

  const {
    success,
    error,
    data: validatedFields,
  } = waitlistSchema.safeParse(body);

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        errors: z.treeifyError(error),
        message: 'Validation failed.',
      },
      { status: 400 },
    );
  }

  const { email, firstName, lastName, category, phone } = validatedFields!;

  const [created] = await db
    .insert(waitlist)
    .values({ email, firstName, lastName, category, phone })
    .onConflictDoNothing({ target: waitlist.email })
    .returning({ id: waitlist.id });
  if (!created) {
    return NextResponse.json(
      { success: false, message: 'You are already on the waitlist.' },
      { status: 409 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      errors: {},
      message: 'Successfully joined the waitlist!',
    },
    { status: 201 },
  );
}

export const POST = withApi('/api/waitlist', handlePOST, false);
