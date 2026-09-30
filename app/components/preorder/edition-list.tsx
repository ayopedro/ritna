'use client';

import type { Book } from '../../lib/types';
import { EditionCard } from './edition-card';

interface EditionListProps {
  books: Book[];
  isLoading: boolean;
}

export function EditionList({ books, isLoading }: EditionListProps) {
  return (
    <div className='space-y-4'>
      <h2 className='text-lg font-bold text-slate-900'>Choose your edition</h2>
      {isLoading && <p className='text-slate-500'>Fetching books...</p>}
      {!isLoading && books.length === 0 && (
        <p className='text-slate-500'>Books will be available soon.</p>
      )}
      {books.map((book) => (
        <EditionCard key={book.id} book={book} />
      ))}
    </div>
  );
}
