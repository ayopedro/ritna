'use client';

import Image from 'next/image';
import { BookOpen } from 'lucide-react';
import { Button } from './button';

export function Hero() {
  return (
    <section className='w-full max-w-350 mx-auto px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16 items-center'>
      <div className='flex flex-col items-start lg:pr-12'>
        <div className='inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full text-sm font-medium text-[#187296] shadow-sm mb-8'>
          <BookOpen className='w-4 h-4' />
          <span>Coming Summer 2026</span>
        </div>

        <h1 className='text-5xl md:text-6xl lg:text-[4.5rem] font-serif text-gray-900 leading-[1.1] mb-6 tracking-tight'>
          Rumbles in the <br />
          <span className='text-[#20667e]'>New Academy</span>
        </h1>

        <p className='text-[#1c2c36] text-lg max-w-md mb-10 leading-relaxed font-medium'>
          History. Humour. Discipline. Camaraderie. Indelible Memories.
        </p>
        <p className='text-[#1c2c36] text-lg max-w-md mb-10 leading-relaxed font-medium'>
          Join the waitlist to be the first to read it.
        </p>

        <div className='flex flex-col sm:flex-row gap-3 w-full mb-8'>
          <Button
            type='button'
            text='Join Waitlist'
            className='bg-[#157a97] hover:bg-[#12647c] text-white'
            onClick={() => {
              document.getElementById('waitlist')?.scrollIntoView({
                behavior: 'smooth',

                block: 'start',
              });
            }}
          />
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex -space-x-3'>
            <Image
              src='https://i.pravatar.cc/100?img=44'
              alt='Reader'
              width={40}
              height={40}
              className='w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover'
            />
            <Image
              src='https://i.pravatar.cc/100?img=47'
              alt='Reader'
              width={40}
              height={40}
              className='w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover'
            />
            <Image
              src='https://i.pravatar.cc/100?img=48'
              alt='Reader'
              width={40}
              height={40}
              className='w-10 h-10 rounded-full border-2 border-[#9fcbda] object-cover'
            />
          </div>
          <span className='text-sm font-medium text-[#2d404d]'>
            2,400+ readers on the waitlist
          </span>
        </div>
      </div>

      <div className='relative flex justify-center lg:justify-end mt-8 lg:mt-0'>
        <Image
          src='/assets/book-blue.png'
          alt='Rumbles in the New Academy Book'
          width={1000}
          height={1000}
          className='w-full max-w-225 h-auto object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]'
          priority
        />
      </div>
    </section>
  );
}
