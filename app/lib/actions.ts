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

  const { email, fName, lName } = validatedFields;

  console.log('Validated Waitlist Data:', { email, fName, lName });

  return {
    success: true,
    errors: {},
    message: 'Successfully joined the waitlist!',
  };
}
