import { toast } from 'sonner';
import { waitlistSchema } from '../lib/validators';
import { useState } from 'react';

interface WaitlistProps {
  onSuccess?: () => void;
}

const Waitlist = ({ onSuccess }: WaitlistProps) => {
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setIsPending(true);
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);

    const { success, data: validatedFields } = waitlistSchema.safeParse(data);
    if (!success) {
      setIsPending(false);
      toast.error('Please check the form for errors');
      return;
    }

    toast.promise(
      async () => {
        const response = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validatedFields),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Failed to join waitlist');
        }

        onSuccess?.();
        setIsPending(false);
        return result;
      },
      {
        loading: 'Adding you to the list...',
        success: 'You have been added to the waitlist!',
        error: (err) => err.message,
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='form' autoComplete='off'>
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
    </>
  );
};

export default Waitlist;
