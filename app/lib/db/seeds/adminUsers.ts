import { z } from 'zod';

const email = process.env.ADMIN_EMAIL?.trim();
const parsed = email ? z.string().toLowerCase().email().max(255).safeParse(email) : null;
if (parsed && !parsed.success) {
  throw new Error('ADMIN_EMAIL must be a valid admin email address when configured.');
}

// Admins can also be added directly to admin_users; bootstrap seeding is optional.
export default parsed?.success ? [{ email: parsed.data }] : [];
