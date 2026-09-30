'use client';

import { useState } from 'react';
import { useCartStore } from '../lib/stores/cart';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Book } from '../lib/types';
import { useGetBooks } from '../services/queries/book';
import { BookCarousel } from '../components/preorder/book-carousel';
import { EditionList } from '../components/preorder/edition-list';
import { MobileCart } from '../components/preorder/mobile-cart';
import { OrderSummary } from '../components/preorder/order-summary';
import ShippingModal from '../components/modals/shipping-modal';

export function Preorder() {
  const items = useCartStore((state) => state.items);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: books = [], isLoading } = useGetBooks<Book[]>();

  const booksById = new Map(books.map((book) => [book.id, book]));
  const selectedBooks = items.flatMap(({ id, quantity }) => {
    const book = booksById.get(id);
    return book && quantity > 0 ? [{ book, quantity }] : [];
  });
  const { total, itemCount } = selectedBooks.reduce(
    (summary, { book, quantity }) => ({
      total: summary.total + book.price * quantity,
      itemCount: summary.itemCount + quantity,
    }),
    { total: 0, itemCount: 0 },
  );

  function openShipping() {
    setIsCartOpen(false);
    setModalOpen(true);
  }

  return (
    <section
      id='preorder'
      className='w-full scroll-mt-6 border-t border-slate-200 bg-white text-slate-900'
    >
      <div className='mx-auto max-w-7xl px-4 pt-10 pb-28 sm:px-6 lg:px-12 lg:py-16'>
        <Link
          href='/'
          className='mb-8 inline-flex items-center gap-2 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900'
        >
          <ArrowLeft aria-hidden='true' className='h-4 w-4' />
          Back to home
        </Link>
        <h1 className='mb-3 text-3xl font-medium tracking-tight sm:text-4xl'>
          Reserve your copy of RITNA before launch day
        </h1>
        <p className='mb-8 text-slate-500'>
          Choose your book, tell us where to send it, and secure your pre-order.
        </p>

        <div className='grid gap-10 lg:grid-cols-2'>
          <div className='min-w-0'>
            <BookCarousel />
            <EditionList books={books} isLoading={isLoading} />
          </div>

          <div className='hidden lg:block lg:self-stretch'>
            <OrderSummary
              selectedBooks={selectedBooks}
              total={total}
              onPayNow={openShipping}
            />
          </div>
        </div>
      </div>

      <MobileCart
        open={isCartOpen}
        onOpenChange={setIsCartOpen}
        itemCount={itemCount}
        total={total}
      >
        <OrderSummary
          selectedBooks={selectedBooks}
          total={total}
          onPayNow={openShipping}
          variant='drawer'
        />
      </MobileCart>

      <ShippingModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        totalAmount={total}
      />
    </section>
  );
}

export default Preorder;
