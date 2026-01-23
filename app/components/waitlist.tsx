'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import { addToWaitlist } from '../lib/actions';

interface WaitlistProps {
  onSuccess?: () => void;
}

const Waitlist = ({ onSuccess }: WaitlistProps) => {
  const [state, formAction, isPending] = useActionState(addToWaitlist, null);

  useEffect(() => {
    if (state?.success) {
      toast.success('You have been added to the waitlist!');
      onSuccess?.();
    } else {
      toast.error(state?.message || 'Something went wrong');
    }
  }, [state, onSuccess]);

  return (
    <form action={formAction} className='form' autoComplete='off'>
      <div className='form-group'>
        <label htmlFor='firstName'>
          First Name<span className='text-red-500'>*</span>
        </label>
        <input
          type='text'
          name='firstName'
          placeholder='John'
          required
          className='form-input'
        />
      </div>
      <div className='form-group'>
        <label htmlFor='lastName'>Last Name</label>
        <input
          type='text'
          name='lastName'
          placeholder='Doe'
          className='form-input'
        />
      </div>
      <div className='form-group'>
        <label htmlFor='email'>
          Email<span className='text-red-500'>*</span>
        </label>
        <input
          type='email'
          name='email'
          placeholder='email@example.com'
          required
          className='form-input'
        />
      </div>
      <input
        type='submit'
        value={isPending ? 'Please wait...' : 'Join Waitlist'}
        className='btn btn-secondary mt-8'
        disabled={isPending}
      />
    </form>
  );
};

export default Waitlist;
