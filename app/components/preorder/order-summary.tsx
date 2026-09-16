'use client';

import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import type { Book } from '../../lib/types';
import { formatPrice } from './preorder.constants';

interface SelectedBook {
  book: Book;
  quantity: number;
}

interface OrderSummaryProps {
  selectedBooks: SelectedBook[];
  total: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onPayNow: () => void;
}

export function OrderSummary({
  selectedBooks,
  total,
  onUpdateQuantity,
  onPayNow,
}: OrderSummaryProps) {
  return (
    <div className='h-fit rounded-2xl border border-slate-200 bg-[#f8fafc] p-6 shadow-xs lg:sticky lg:top-8'>
      <h2 className='mb-5 text-lg font-semibold text-slate-950'>Order summary</h2>

      <div className='mb-6 space-y-4 rounded-2xl border border-slate-100 bg-white p-4'>
        {selectedBooks.length === 0 ? (
          <p className='py-2 text-center text-sm text-slate-500'>
            No items selected. Choose an edition to see it here.
          </p>
        ) : (
          selectedBooks.map(({ book, quantity }) => (
            <div key={book.id} className='flex items-center justify-between gap-3'>
              <div className='flex min-w-0 items-center gap-3'>
                {book.image && (
                  <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100'>
                    <Image
                      src={book.image}
                      alt={book.title}
                      fill
                      sizes='48px'
                      className='object-cover'
                    />
                  </div>
                )}
                <div className='min-w-0'>
                  <p className='truncate text-sm font-medium text-slate-900'>
                    {book.title}
                  </p>
                  <div className='mt-1 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5'>
                    <button
                      type='button'
                      aria-label={`Decrease ${book.title} quantity`}
                      onClick={() => onUpdateQuantity(book.id, quantity - 1)}
                      className='cursor-pointer text-slate-500 hover:text-slate-900'
                    >
                      <Minus className='h-3 w-3' />
                    </button>
                    <span className='min-w-3 text-center text-xs font-semibold text-slate-800'>
                      {quantity}
                    </span>
                    <button
                      type='button'
                      aria-label={`Increase ${book.title} quantity`}
                      onClick={() => onUpdateQuantity(book.id, quantity + 1)}
                      className='cursor-pointer text-slate-500 hover:text-slate-900'
                    >
                      <Plus className='h-3 w-3' />
                    </button>
                  </div>
                </div>
              </div>
              <span className='shrink-0 text-sm font-semibold text-slate-900'>
                {formatPrice(book.price * quantity)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className='flex items-center justify-between border-t border-slate-200 pt-4 font-semibold text-slate-950'>
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
      <button
        type='button'
        disabled={selectedBooks.length === 0}
        onClick={onPayNow}
        className='mt-6 w-full rounded-full bg-black px-4 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50'
      >
        Pay now
      </button>
      <p className='mt-3 text-xs leading-snug text-slate-500'>
        Delivery charges are collected at checkout.
      </p>
    </div>
  );
}
