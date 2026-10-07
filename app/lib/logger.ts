import { PaymentError } from './payments/payment-error';
import { AsyncLocalStorage } from 'node:async_hooks';
import type { LogContext, LogFields } from '@/app/lib/types';

export const logContext = new AsyncLocalStorage<LogContext>();

export function log(
  level: 'info' | 'warn' | 'error',
  event: string,
  fields: LogFields = {},
) {
  const safe = Object.fromEntries(
    Object.entries(fields).filter(([key]) =>
      [
        'status',
        'durationMs',
        'orderId',
        'paymentId',
        'provider',
        'errorType',
        'errorCode',
        'errorMessage',
        'providerErrorCode',
        'providerErrorMessage',
        'errorFields',
        'checkoutPayload',
        'checkoutHost',
      ].includes(key),
    ),
  );
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...logContext.getStore(),
    ...safe,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export function logError(
  event: string,
  error: unknown,
  fields: LogFields = {},
) {
  if (error instanceof PaymentError) {
    log('error', event, {
      ...fields,
      ...error.diagnostics,
      errorType: error.name,
      errorCode: error.code,
      errorMessage: error.message,
    });
    return;
  }
  const errorType =
    error instanceof Error ? error.constructor.name : 'UnknownError';
  const candidate = error instanceof Error && error.cause ? error.cause : error;
  const code =
    candidate && typeof candidate === 'object' && 'code' in candidate
      ? candidate.code
      : undefined;
  const errorCode =
    typeof code === 'string' && /^(?:[0-9A-Z]{5}|E[A-Z_]{2,30})$/.test(code)
      ? code
      : undefined;
  const errorMessage =
    errorCode === '42703'
      ? 'Database column is missing; apply the pending database migrations.'
      : errorCode === '42P01'
        ? 'Database table is missing; apply the database migrations.'
        : errorCode === 'ECONNREFUSED'
          ? 'Connection refused; check the configured service address and availability.'
          : undefined;
  log('error', event, { ...fields, errorType, errorCode, errorMessage });
}
