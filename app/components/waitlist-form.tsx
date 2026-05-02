'use client';

import { waitlistSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Button } from './button';
import { useJoinWaitlistMutation } from '../services/mutations/wishlist';
import toast from 'react-hot-toast';

export type JoinWaitlistFormData = {
  firstName: string;
  lastName: string;
  email: string;
  category: 'civilian' | 'military';
};

const WaitlistForm = () => {
  const initialFormData: JoinWaitlistFormData = {
    firstName: '',
    lastName: '',
    email: '',
    category: 'civilian',
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<JoinWaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: initialFormData,
  });

  const { mutate, isPending } = useJoinWaitlistMutation();

  const submitForm: SubmitHandler<JoinWaitlistFormData> = async (formData) => {
    mutate(formData, {
      onSuccess() {
        toast.success("Successfully added to the waitlist");
        reset();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submitForm)}
      className='form w-full p-4'
      autoComplete='off'
    >
      <div className='flex flex-col md:flex-row justify-between gap-4'>
        <div className='form-group'>
          <label htmlFor='firstName'>
            First Name<span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            {...register('firstName')}
            placeholder='John'
            required
            className='form-input'
          />
          {errors.firstName && (
            <p className='form-error'>{errors.firstName.message}</p>
          )}
        </div>
        <div className='form-group'>
          <label htmlFor='lastName'>
            Last Name<span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            {...register('lastName')}
            placeholder='Doe'
            className='form-input'
          />
          {errors.lastName && (
            <p className='form-error'>{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <div className='flex justify-between gap-4'>
        <div className='form-group'>
          <label htmlFor='email'>
            Email<span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            {...register('email')}
            placeholder='email@example.com'
            required
            className='form-input'
          />
          {errors.email && <p className='form-error'>{errors.email.message}</p>}
        </div>
        {/* TODO: Phone input to be added */}
      </div>
      <div className='form-group'>
        <label className='block mb-2'>
          Category<span className='text-red-500'>*</span>
        </label>
        {errors.category && (
          <p className='form-error'>{errors.category.message}</p>
        )}
        <div className='flex flex-row items-center gap-4'>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              {...register('category')}
              value='civilian'
              required
              className='h-4 w-4 accent-blue-500'
            />
            <label htmlFor='category-civilian' className='cursor-pointer'>
              Civilian
            </label>
          </div>
          <div className='flex items-center gap-2'>
            <input
              type='radio'
              id='category-military'
              {...register('category')}
              value='military'
              required
              className='h-4 w-4 accent-blue-500'
            />
            <label htmlFor='category-military' className='cursor-pointer'>
              Military
            </label>
          </div>
        </div>
      </div>
      <Button
        type='submit'
        text={isPending ? 'Please wait...' :'Join Now'}
        className='bg-[#0a1120] text-white hover:bg-[#1a2b3c] px-8 py-3 w-full sm:w-auto mt-4'
        disabled={isPending || !isValid}
      />
    </form>
  );
};

export default WaitlistForm;
