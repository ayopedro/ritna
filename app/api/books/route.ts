import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { books } from '@/app/lib/db/schema';
import { NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';

async function handleGET() {
  const bookList = await db
    .select()
    .from(books)
    .orderBy(desc(books.available), asc(books.createdAt), asc(books.id));

  return NextResponse.json({
    success: true,
    data: { books: bookList },
  });
}

export const GET = withApi('/api/books', handleGET, false);
