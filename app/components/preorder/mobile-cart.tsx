'use client';

import type { MobileCartProps } from "@/lib/types";

import * as Dialog from '@radix-ui/react-dialog';
import { ShoppingCart, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function MobileCart({
  open,
  onOpenChange,
  itemCount,
  total,
  children,
}: MobileCartProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
          <div>{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
