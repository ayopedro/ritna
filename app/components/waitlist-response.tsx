interface WaitlistResponseProps {
  isSuccess: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

const WaitlistResponse = ({
  isSuccess,
  message,
  errors,
}: WaitlistResponseProps) => {
  return (
    <div
      className={`p-4 mb-4 rounded-md ${isSuccess ? 'bg-green-50' : 'bg-red-50'}`}
    >
      <p className={isSuccess ? 'text-green-600' : 'text-red-600'}>{message}</p>
      {errors && (
        <ul className='mt-2 list-disc list-inside text-red-600'>
          {Object.entries(errors).map(([field, msgs]) =>
            msgs.map((msg, idx) => (
              <li key={`${field}-error-${idx}`} className="text-sm">
                {msg}
              </li>
            )),
          )}
        </ul>
      )}
    </div>
  );
};

export default WaitlistResponse;
