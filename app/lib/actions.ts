'use server';

import { waitlistSchema } from './validators';

export async function addToWaitlist(
  prevState: unknown,
  formData: FormData,
): Promise<{
  success: boolean;
  errors: Record<string, string[]>;
  message: string;
}> {
  const data = Object.fromEntries(formData.entries());

  const {
    success,
    error,
    data: validatedFields,
  } = waitlistSchema.safeParse(data);

  if (!success) {
    return {
      success: false,
      errors: error.flatten().fieldErrors,
      message: 'Validation failed.',
    };
  }

  const { email, firstName, lastName } = validatedFields;

  const isExisting = true; // Replace with actual check

  if (isExisting) {
    return {
      success: false,
      errors: { email: ['This email is already on the waitlist.'] },
      message: 'You are already on the waitlist.',
    };
  }

  console.log('Validated Waitlist Data:', { email, firstName, lastName });

  return {
    success: true,
    errors: {},
    message: 'Successfully joined the waitlist!',
  };
}
