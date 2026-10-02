import type { Metadata } from 'next';
import type { PaymentResultPageProps } from '@/app/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  Clock3,
  Mail,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react';
import { paymentReferenceSchema } from '@/app/lib/validators';
import { verifyOrderPayment } from '@/app/lib/payments/verify-order-payment';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Your preorder payment — RITNA',
  robots: { index: false, follow: false },
};

const statuses = {
  confirmed: {
    label: 'Payment confirmed',
    title: "You're part of the story.",
    message:
      'Thank you for preordering RITNA. Your payment is confirmed, and your preorder is secured.',
    detail:
      'Keep your payment reference for any questions about your order.',
    icon: CircleCheck,
    colors: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
  pending: {
    label: 'Confirmation pending',
    title: 'A moment for confirmation.',
    message:
      "We haven't confirmed your payment yet. If you've completed checkout, give it a moment and check again.",
    detail: "Please don't make another payment while confirmation is pending.",
    icon: Clock3,
    colors: 'bg-amber-50 text-amber-800 ring-amber-100',
  },
  failed: {
    label: 'Payment unsuccessful',
    title: "Let's get this sorted.",
    message:
      "Paystack reports that this payment was unsuccessful. Your preorder payment hasn't been confirmed.",
    detail:
      'Contact us with your payment reference for help retrying. If you were debited, mention that in your message.',
    icon: TriangleAlert,
    colors: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  reversed: {
    label: 'Payment reversed',
    title: 'Your payment was reversed.',
    message: 'Paystack reports that this payment has been reversed.',
    detail:
      'Contact us with your payment reference before attempting another payment.',
    icon: RefreshCw,
    colors: 'bg-rose-50 text-rose-700 ring-rose-100',
  },
  invalid: {
    label: 'Reference unavailable',
    title: "We can't find your reference.",
    message:
      'This page needs a valid payment reference to check your preorder.',
    detail:
      "Open the link you received after checkout. If you've already paid, contact us before making another payment.",
    icon: TriangleAlert,
    colors: 'bg-slate-100 text-slate-600 ring-slate-200',
  },
};

export default async function PaymentResult({
  searchParams,
}: PaymentResultPageProps) {
  const reference = paymentReferenceSchema.safeParse(
    (await searchParams).reference,
  );
  let status: keyof typeof statuses = reference.success ? 'pending' : 'invalid';
  let emailPending = false;
  if (reference.success) {
    try {
      const result = await verifyOrderPayment(reference.data);
      if (result.providerStatus === 'success') {
        status = 'confirmed';
        emailPending = result.confirmationEmailPending;
      } else if (result.providerStatus === 'failed') status = 'failed';
      else if (result.providerStatus === 'reversed') status = 'reversed';
    } catch {
      // Verification can be retried without asking the reader to pay twice.
    }
  }
  const content = statuses[status];
  const StatusIcon = content.icon;
  const supportEmail = process.env.ORDER_SUPPORT_EMAIL?.trim();
  const supportHref = supportEmail
    ? `mailto:${supportEmail}?subject=${encodeURIComponent('RITNA preorder payment')}&body=${encodeURIComponent(reference.success ? `Payment reference: ${reference.data}` : 'I need help locating my preorder payment reference.')}`
    : null;
  const focus =
    'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700';

  return (
    <main className='min-h-screen bg-[#f5f6f8] px-4 py-6 text-slate-900 sm:px-8 sm:py-10 lg:px-12'>
      <header className='mx-auto mb-8 flex max-w-6xl items-center justify-between sm:mb-12'>
        <Link
          href='/'
          aria-label='RITNA home'
          className={`text-xl font-extrabold tracking-[0.18em] ${focus}`}
        >
          RITNA<span className='text-blue-600'>.</span>
        </Link>
        <Link
          href='/preorder'
          className={`inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-950 sm:text-sm ${focus}`}
        >
          <ArrowLeft aria-hidden='true' size={16} /> Back to preorder
        </Link>
      </header>

      <div className='mx-auto grid max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-40px_rgba(15,23,42,0.3)] lg:min-h-160 lg:grid-cols-[0.9fr_1.1fr]'>
        <aside className='relative flex flex-col overflow-hidden bg-[#0c2737] px-7 py-8 text-white sm:px-10 lg:py-12'>
          <div
            aria-hidden='true'
            className='pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl'
          />
          <p className='relative text-[10px] font-semibold uppercase tracking-[0.3em] text-sky-200/70'>
            Rumbles in the New Academy
          </p>
          <div className='relative my-5 hidden flex-1 items-center justify-center sm:flex'>
            <Image
              src='/assets/book-blue.png'
              alt='RITNA book cover by Olufemi Akinwunmi'
              width={1080}
              height={810}
              sizes='(min-width: 1024px) 440px, 600px'
              priority
              className='h-auto w-full max-w-md drop-shadow-2xl'
            />
          </div>
          <div className='relative mt-5 border-t border-white/15 pt-6 sm:mt-0'>
            <p className='max-w-xs font-serif text-3xl leading-tight sm:text-4xl'>
              Every great story starts with a reader.
            </p>
            <p className='mt-4 text-xs tracking-wide text-sky-100/60'>
              RITNA · Olufemi Akinwunmi
            </p>
          </div>
        </aside>

        <section
          aria-labelledby='payment-heading'
          className='px-6 py-9 sm:px-10 sm:py-12 lg:px-12'
        >
          <div
            className={`mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ${content.colors}`}
          >
            <StatusIcon aria-hidden='true' size={28} strokeWidth={1.7} />
          </div>
          <p className='mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500'>
            {content.label}
          </p>
          <h1
            id='payment-heading'
            className='max-w-md text-3xl font-semibold leading-tight tracking-tight sm:text-4xl'
          >
            {content.title}
          </h1>
          <p className='mt-5 text-sm leading-7 text-slate-600'>
            {content.message}
          </p>

          {status === 'confirmed' && (
            <div className='mt-6 flex gap-3 text-sm leading-6 text-slate-600'>
              <Mail
                aria-hidden='true'
                size={19}
                className='mt-1 shrink-0 text-slate-400'
              />
              <p>
                {emailPending
                  ? 'Your payment is confirmed. Your confirmation email is still pending; keep this reference for your records.'
                  : 'Your order confirmation has been sent by email. Please check your inbox and spam folder.'}
              </p>
            </div>
          )}
          {reference.success && (
            <div className='mt-7 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4'>
              <p className='mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500'>
                Payment reference
              </p>
              <p className='break-all font-mono text-xs leading-6 text-slate-800 wrap-anywhere'>
                {reference.data}
              </p>
            </div>
          )}
          <p className='mt-4 text-xs leading-6 text-slate-500'>
            {content.detail}
          </p>

          <div className='mt-8 flex flex-col gap-3'>
            {status === 'pending' && reference.success ? (
              <a
                href={`/preorder/payment?reference=${encodeURIComponent(reference.data)}`}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 ${focus}`}
              >
                <RefreshCw aria-hidden='true' size={16} /> Check payment again
              </a>
            ) : (
              <Link
                href={status === 'confirmed' ? '/' : '/preorder'}
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 ${focus}`}
              >
                {status === 'confirmed' ? 'Back to home' : 'Back to preorder'}{' '}
                <ArrowRight aria-hidden='true' size={16} />
              </Link>
            )}
            {supportHref && (
              <a
                href={supportHref}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 ${focus}`}
              >
                <Mail aria-hidden='true' size={16} /> Contact support
              </a>
            )}
          </div>
          <div className='mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-[11px] text-slate-400'>
            {status === 'confirmed' ? (
              <Check aria-hidden='true' size={14} />
            ) : (
              <ShieldCheck aria-hidden='true' size={14} />
            )}
            Payments processed by Paystack
          </div>
        </section>
      </div>
      <p className='mx-auto mt-7 max-w-6xl text-center text-[11px] text-slate-400'>
        Rumbles in the New Academy · Thank you for supporting the story.
      </p>
    </main>
  );
}
