import { z } from 'zod';

export const waitlistSchema = z.object({
  fName: z.string().min(2, "First name must be at least 2 characters"),
  lName: z.string().min(2, "Last name must be at least 2 characters").optional(),
  email: z.email("Please enter a valid email address"),
});