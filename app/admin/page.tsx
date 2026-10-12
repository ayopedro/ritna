'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AdminBooks } from '@/app/components/admin/books';
import { useGetAdminStats } from '@/app/services/queries/admin';
import type { AdminStats } from '../lib/types';
import { AdminTables } from '@/app/components/admin/tables';

export default function AdminPage() {
  const { data, isLoading, isError, refetch } = useGetAdminStats<AdminStats>();

  const [logoutError, setLogoutError] = useState('');
  async function logout() {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      window.location.assign('/admin/login');
    } catch { setLogoutError('Unable to sign out. Please try again.'); }
  }

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10'>
      <div className='mx-auto max-w-6xl'>
        <header className='mb-8 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600'>
              RITNA
            </p>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>
              Admin dashboard
            </h1>
            <p className='mt-2 text-sm text-slate-500'>
              Manage books, orders, and the waitlist.
            </p>
          </div>
          <div className="flex items-center gap-3">
          <button onClick={() => void logout()} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium">Sign out</button>
          <Link
            href='/'
            className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100'
          >
            View site
          </Link>
          </div>
        </header>

        {logoutError && <p role="alert">{logoutError}</p>}
        {isLoading && <p role='status' className='mb-6 text-slate-500'>Loading dashboard...</p>}
        {isError && (
          <div role='alert' className='mb-6 rounded-xl bg-red-50 p-4 text-red-700'>
            Unable to load the dashboard.
            <button type='button' onClick={() => void refetch()} className='ml-3 underline'>Retry</button>
          </div>
        )}

        <section
          aria-label='Overview'
          className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'
        >
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Orders</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>
              {data?.orderCount}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Waitlist</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>
              {data?.waitlistCount}
            </p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Reviews</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>
              {data?.reviewCount}
            </p>
          </div>
        </section>

        <AdminBooks />

        {data && <AdminTables />}
      </div>
    </main>
  );
}
