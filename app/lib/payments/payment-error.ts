import type { LogFields } from '@/app/lib/types';

export class PaymentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly diagnostics: Pick<
      LogFields,
      | 'provider'
      | 'status'
      | 'providerErrorCode'
      | 'providerErrorMessage'
      | 'errorFields'
    > = {},
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = 'PaymentError';
  }
}
