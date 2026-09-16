'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ShoppingCart, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ShippingModal, type ShippingDetails } from './modals';
import { BookCarousel } from './preorder/book-carousel';
import { EditionCard } from './preorder/edition-card';
import { OrderSummary } from './preorder/order-summary';
import { formatPrice } from './preorder/preorder.constants';
import type { Book } from '../lib/types';
import { useGetBooks } from '../services/queries/book';

export function Preorder() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);

  const { data: books = [], isLoading } = useGetBooks<Book[]>();

  const selectedBooks = books.flatMap((book) => {
    const quantity = cart[book.id] ?? 0;
    return quantity > 0 ? [{ book, quantity }] : [];
  });
  const total = selectedBooks.reduce(
    (sum, { book, quantity }) => sum + book.price * quantity,
    0,
  );
  const itemCount = selectedBooks.reduce(
    (sum, { quantity }) => sum + quantity,
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

  function openShipping() {
    setIsCartOpen(false);
    setIsShippingModalOpen(true);
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
          <div>
            <BookCarousel />
            <div className='space-y-4'>
              <h2 className='text-lg font-bold text-slate-900'>
                Choose your edition
              </h2>
              {isLoading ? (
                <p className='text-slate-500'>Fetching books...</p>
              ) : (
                books.length === 0 && (
                  <p className='text-slate-500'>
                    Books will be available soon.
                  </p>
                )
              )}
              {books.map((book) => (
                <EditionCard
                  key={book.id}
                  book={book}
                  quantity={cart[book.id] ?? 0}
                  onUpdateQuantity={(quantity) =>
                    updateQuantity(book.id, quantity)
                  }
                />
              ))}
            </div>
          </div>

          <div className='hidden lg:block lg:self-stretch'>
            <OrderSummary
              selectedBooks={selectedBooks}
              total={total}
              onUpdateQuantity={updateQuantity}
              onPayNow={openShipping}
            />
          </div>
        </div>
      </div>

      <Dialog.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
        <div className='fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-lg backdrop-blur lg:hidden'>
          <Dialog.Trigger asChild>
            <button
              type='button'
              className='flex w-full items-center justify-between rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950'
            >
              <span className='flex items-center gap-2'>
                <ShoppingCart aria-hidden='true' className='h-5 w-5' />
                View cart ({itemCount})
              </span>
              <span>{formatPrice(total)}</span>
            </button>
          </Dialog.Trigger>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 z-50 bg-black/50 lg:hidden' />
          <Dialog.Content className='fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl focus:outline-none lg:hidden'>
            <Dialog.Title className='sr-only'>Order summary</Dialog.Title>
            <Dialog.Description className='sr-only'>
              Review the books in your cart and continue to checkout.
            </Dialog.Description>
            <Dialog.Close asChild>
              <button
                type='button'
                aria-label='Close order summary'
                className='absolute top-5 right-5 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              >
                <X aria-hidden='true' className='h-5 w-5' />
              </button>
            </Dialog.Close>
            <div>
              <OrderSummary
                selectedBooks={selectedBooks}
                total={total}
                onUpdateQuantity={updateQuantity}
                onPayNow={openShipping}
                variant='drawer'
              />
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
