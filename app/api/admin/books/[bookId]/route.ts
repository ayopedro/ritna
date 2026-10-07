import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { books } from '@/app/lib/db/schema';

export const PATCH = withApi('/api/admin/books/[bookId]', async (request, context: { params: Promise<{ bookId: string }> }) => {
  const { bookId } = await context.params;
  const parsed = z.object({ price: z.number().int().min(0).max(2147483647), available: z.boolean(),
    title: z.string().trim().min(1).max(255).optional(),
    description: z.string().trim().max(1000).nullable().optional(),
    type: z.enum(['hardcover', 'softcover', 'institutional']).optional(),
    image: z.string().trim().max(255).refine((value) => value.startsWith('/') && !value.startsWith('//') || /^https:\/\//.test(value), 'Use a local image path or HTTPS URL.').nullable().optional() }).strict()
    .refine((book) => !book.available || book.price > 0, { message: 'An available book must have a positive price.' })
    .safeParse(await request.json().catch(() => null));
  if (!z.uuid().safeParse(bookId).success || !parsed.success) return NextResponse.json({ message: 'Invalid book details. Check the title, image, and whole-naira price. Available books must cost at least ₦1.' }, { status: 400 });
  const [book] = await db.update(books).set({ ...parsed.data, updatedAt: new Date() }).where(eq(books.id, bookId)).returning();
  if (!book) return NextResponse.json({ message: 'Book not found.' }, { status: 404 });
  return NextResponse.json({ success: true, data: book });
}, true);
