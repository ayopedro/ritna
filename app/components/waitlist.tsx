import { Gift, Bell } from 'lucide-react';
import WaitlistForm from './waitlist-form';

export function Waitlist() {
  return (
    <section className='w-full bg-[#eff6ff] py-24 px-6 text-center' id='waitlist'>
      <div className='max-w-250 mx-auto'>
        <div className='mb-12'>
          <h3 className='text-blue-600 text-xs font-bold uppercase tracking-[0.3em] mb-4'>
            Don&apos;t Miss Out
          </h3>
          <h2 className='text-[#1a2b3c] text-4xl md:text-5xl font-serif mb-6'>
            Join the Waitlist Today
          </h2>
          <p className='text-slate-500 text-sm md:text-base max-w-md mx-auto leading-relaxed'>
            Be among the first to experience this deeply moving story. Sign up
            now and get exclusive early access.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 md:w-1/2 mx-auto'>
          <div className='bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-left'>
            <div className='bg-blue-50 p-2 rounded-lg'>
              <Gift className='text-blue-600 w-5 h-5' />
            </div>
            <p className='text-slate-600 text-xs font-medium leading-snug'>
              Signed first edition for early supporters
            </p>
          </div>

          <div className='bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 text-left'>
            <div className='bg-blue-50 p-2 rounded-lg'>
              <Bell className='text-blue-600 w-5 h-5' />
            </div>
            <p className='text-slate-600 text-xs font-medium leading-snug'>
              Be notified before the public launch
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row md:w-2/3 mx-auto gap-3'>
          <WaitlistForm />
        </div>

        <p className='text-slate-400 text-[10px] uppercase tracking-widest'>
          No spam, ever. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
