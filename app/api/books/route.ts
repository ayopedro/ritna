import { db } from '@/app/lib/db';
import { books } from '@/app/lib/db/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  const bookList = await db.select().from(books);

  return NextResponse.json({
    success: true,
    data: { books: bookList },
  });
}
