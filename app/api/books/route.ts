import { withApi } from '@/app/lib/api/handler';
import { db } from '@/app/lib/db';
import { books } from '@/app/lib/db/schema';
import { NextResponse } from 'next/server';

async function handleGET() {
  const bookList = await db.select().from(books);

  return NextResponse.json({
    success: true,
    data: { books: bookList },
  });
}

export const GET = withApi('/api/books', handleGET, false);
