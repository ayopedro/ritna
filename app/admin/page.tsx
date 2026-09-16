import Link from 'next/link';
import { count, desc, eq } from 'drizzle-orm';
import { db } from '@/app/lib/db';
import { customers, orders, reviews, waitlist } from '@/app/lib/db/schema';

export const dynamic = 'force-dynamic';

const formatDate = (date: Date | null) =>
  date ? new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(date) : '—';

export default async function AdminPage() {
  const [orderRows, waitlistRows, [reviewCount]] = await Promise.all([
    db
      .select({
        id: orders.id,
        status: orders.status,
        createdAt: orders.createdAt,
        firstName: customers.firstName,
        lastName: customers.lastName,
        email: customers.email,
      })
      .from(orders)
      .innerJoin(customers, eq(orders.customerId, customers.id))
      .orderBy(desc(orders.createdAt)),
    db
      .select({
        id: waitlist.id,
        firstName: waitlist.firstName,
        lastName: waitlist.lastName,
        email: waitlist.email,
        phone: waitlist.phone,
        category: waitlist.category,
        createdAt: waitlist.createdAt,
      })
      .from(waitlist)
      .orderBy(desc(waitlist.createdAt)),
    db.select({ value: count() }).from(reviews),
  ]);

  return (
    <main className='min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-10'>
      <div className='mx-auto max-w-6xl'>
        <header className='mb-8 flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600'>RITNA</p>
            <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Admin dashboard</h1>
            <p className='mt-2 text-sm text-slate-500'>Orders and waitlist at a glance.</p>
          </div>
          <Link href='/' className='rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100'>
            View site
          </Link>
        </header>

        <section aria-label='Overview' className='mb-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3'>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Orders</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>{orderRows.length}</p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Waitlist</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>{waitlistRows.length}</p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-5'>
            <p className='text-sm text-slate-500'>Reviews</p>
            <p className='mt-2 text-3xl font-semibold tabular-nums'>{reviewCount.value}</p>
          </div>
        </section>

        <div className='space-y-6'>
          <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs'>
            <div className='border-b border-slate-100 px-5 py-4 sm:px-6'>
              <h2 className='text-lg font-semibold'>Orders</h2>
            </div>
            <div className='overflow-x-auto'>
              <table aria-label='Orders' className='w-full min-w-[680px] text-left text-sm'>
                <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th scope='col' className='px-5 py-3 font-medium sm:px-6'>Order</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Customer</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Email</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Status</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Placed</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {orderRows.length === 0 ? (
                    <tr><td colSpan={5} className='px-5 py-8 text-center text-slate-500'>No orders yet.</td></tr>
                  ) : orderRows.map((order) => (
                    <tr key={order.id}>
                      <td className='px-5 py-4 font-mono text-xs text-slate-600 sm:px-6' title={order.id}>#{order.id.slice(0, 8)}</td>
                      <td className='px-5 py-4 font-medium'>{order.firstName} {order.lastName}</td>
                      <td className='px-5 py-4'>{order.email}</td>
                      <td className='px-5 py-4 capitalize'>{order.status ?? '—'}</td>
                      <td className='whitespace-nowrap px-5 py-4 text-slate-500'>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs'>
            <div className='border-b border-slate-100 px-5 py-4 sm:px-6'>
              <h2 className='text-lg font-semibold'>Waitlist</h2>
            </div>
            <div className='overflow-x-auto'>
              <table aria-label='Waitlist' className='w-full min-w-[740px] text-left text-sm'>
                <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-500'>
                  <tr>
                    <th scope='col' className='px-5 py-3 font-medium sm:px-6'>Name</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Email</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Phone</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Category</th>
                    <th scope='col' className='px-5 py-3 font-medium'>Joined</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                  {waitlistRows.length === 0 ? (
                    <tr><td colSpan={5} className='px-5 py-8 text-center text-slate-500'>No one on the waitlist yet.</td></tr>
                  ) : waitlistRows.map((person) => (
                    <tr key={person.id}>
                      <td className='px-5 py-4 font-medium sm:px-6'>{person.firstName} {person.lastName ?? ''}</td>
                      <td className='px-5 py-4'>{person.email}</td>
                      <td className='whitespace-nowrap px-5 py-4'>{person.phone ?? '—'}</td>
                      <td className='px-5 py-4 capitalize'>{person.category}</td>
                      <td className='whitespace-nowrap px-5 py-4 text-slate-500'>{formatDate(person.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
