import { useActionState } from 'react';
import { addToWaitlist } from '../lib/actions';
import WaitlistResponse from './waitlist-response';

const Waitlist = () => {
  const [state, formAction, isPending] = useActionState(addToWaitlist, null);

  return (
    <>
      {(state?.success || state?.errors) && (
        <WaitlistResponse isSuccess={state?.success} message={state.message} errors={state.errors} />
      )}
      <form
        action={formAction}
        method='POST'
        className='form'
        autoComplete='off'
      >
        <div className='form-group'>
          <label htmlFor='fName'>
            First Name<span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name='fName'
            placeholder='John'
            required
            className='form-input'
          />
        </div>
        <div className='form-group'>
          <label htmlFor='lName'>Last Name</label>
          <input
            type='text'
            name='lName'
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
