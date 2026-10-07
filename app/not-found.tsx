import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page not found - RITNA',
};

export default function NotFound() {
  const focus = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900';

  return (
    <main className='flex min-h-screen flex-col bg-[#fdfdfc] text-slate-900'>
      <header className='mx-auto w-full max-w-7xl px-6 py-8 lg:px-12'>
        <Link href='/' aria-label='RITNA home' className={`rounded-sm text-sm font-semibold tracking-[0.2em] ${focus}`}>
          RITNA
        </Link>
      </header>
      <section aria-labelledby='not-found-title' className='flex flex-1 items-center justify-center px-6 pb-20'>
        <div className='w-full max-w-xl text-center'>
          <div className='mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#9fcbda]'>
            <BookOpen aria-hidden='true' className='h-7 w-7' />
          </div>
          <p className='mb-4 font-mono text-sm tracking-[0.25em] text-slate-500'>404</p>
          <h1 id='not-found-title' className='text-4xl font-medium tracking-tight sm:text-5xl'>This page is missing.</h1>
          <p className='mx-auto mt-5 max-w-md text-base leading-7 text-slate-600'>
            The link may have changed, or the address may be incorrect. Head back home to pick up where you left off.
          </p>
          <div className='mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link href='/' className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 sm:w-auto ${focus}`}>
              <ArrowLeft aria-hidden='true' className='h-4 w-4' />
              Back to home
            </Link>
            <Link href='/preorder' className={`inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3.5 text-sm font-medium transition-colors hover:bg-slate-100 sm:w-auto ${focus}`}>
              Explore the book
              <ArrowRight aria-hidden='true' className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
