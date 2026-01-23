'use client';

import { useState } from 'react';
import Modal from './components/modal';
import Waitlist from './components/waitlist';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <main className='hero'>
      <div className='flex flex-col items-center justify-center gap-4 md:gap-8 text-center'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <h1 className='text-4xl md:text-8xl font-bold'>
            Rumbles In The New Academy
          </h1>
          <p className='tracking-[20px] font-semibold'>RITNA</p>
        </div>
        <p className='md:text-xl'>
          A story of chaos and travails from the &quot;MAD HOUSE&quot;
        </p>
        <button className='btn btn-secondary' onClick={() => setIsOpen(true)}>
          Join Waitlist
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Join the RITNA Waitlist'
        description='Be the first to know when RITNA is released!'
      >
        <Waitlist onSuccess={() => setIsOpen(false)} />
      </Modal>
    </main>
  );
}
