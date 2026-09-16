'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { ShippingModal, type ShippingDetails } from './modals';
import { BookCarousel } from './preorder/book-carousel';
import { EditionCard } from './preorder/edition-card';
import { OrderSummary } from './preorder/order-summary';
import type { Book } from '../lib/types';
import { useGetBooks } from '../services/queries/book';

export function Preorder() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  const { data: books = [] } = useGetBooks<Book[]>();

  const selectedBooks = books.flatMap((book) => {
    const quantity = cart[book.id] ?? 0;
    return quantity > 0 ? [{ book, quantity }] : [];
  });
  const total = selectedBooks.reduce(
    (sum, { book, quantity }) => sum + book.price * quantity,
    0,
  );

  function updateQuantity(id: string, quantity: number) {
    setCart((current) => {
      const next = { ...current };
      if (quantity <= 0) delete next[id];
      else next[id] = quantity;
      return next;
    });
  }

  function confirmShipping(details: ShippingDetails) {
    toast.success(`Order confirmed for ${details.fullName}!`);
    setCart({});
    setIsShippingModalOpen(false);
  }

  return (
    <section
      id='preorder'
      className='w-full scroll-mt-6 border-t border-slate-200 bg-white text-slate-900'
    >
      <div className='mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-12 lg:py-16'>
        <h1 className='mb-3 text-3xl font-medium tracking-tight sm:text-4xl'>
          Reserve your copy of RITNA before launch day
        </h1>
        <p className='mb-8 text-slate-500'>
          Choose your book, tell us where to send it, and secure your pre-order.
        </p>

        <div className='grid gap-10 lg:grid-cols-2'>
          <div>
            <BookCarousel />
            <div className='space-y-4'>
              <h2 className='text-lg font-bold text-slate-900'>Choose your edition</h2>
              {books.length === 0 && (
                <p className='text-slate-500'>Books will be available soon.</p>
              )}
              {books.map((book) => (
                <EditionCard
                  key={book.id}
                  book={book}
                  quantity={cart[book.id] ?? 0}
                  onUpdateQuantity={(quantity) => updateQuantity(book.id, quantity)}
                />
              ))}
            </div>
          </div>

          <OrderSummary
            selectedBooks={selectedBooks}
            total={total}
            onUpdateQuantity={updateQuantity}
            onPayNow={() => setIsShippingModalOpen(true)}
          />
        </div>
      </div>

      <ShippingModal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        onConfirm={confirmShipping}
        totalAmount={total}
      />
    </section>
  );
}

export default Preorder;
