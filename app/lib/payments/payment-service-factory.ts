import { withSpan } from '../telemetry/tracing';
import type { PaymentRecord, PreorderRecord } from '@/app/lib/types';
import { initializeBachs, verifyBachs } from './bachs';
import {
  initializePaystack,
  validatePaymentMatch,
  verifyPaystack,
} from './paystack';
import type { CheckoutInput, PaymentService } from './payment-service';
import { PaymentError } from './payment-error';

function validateCurrency(input: CheckoutInput) {
  if (input.currency !== 'NGN')
    throw new PaymentError(
      'PAYMENT_CURRENCY_UNSUPPORTED',
      'Preorder checkout currently supports NGN only.',
    );
}

export class BachsPaymentService implements PaymentService {
  readonly provider = 'bachs' as const;
  isConfigured() {
    return Boolean(
      /^sk_(sandbox|live)_/.test(process.env.BACHS_API_KEY ?? '') &&
      process.env.BACHS_CALLBACK_URL?.trim(),
    );
  }
  async initialize(input: CheckoutInput) {
    validateCurrency(input);
    return initializeBachs(input);
  }
  verify(payment: PaymentRecord, order: PreorderRecord) {
    return verifyBachs(payment, order);
  }
}

export class PaystackPaymentService implements PaymentService {
  readonly provider = 'paystack' as const;
  isConfigured() {
    return Boolean(process.env.PAYSTACK_SECRET_KEY);
  }
  async initialize(input: CheckoutInput) {
    validateCurrency(input);
    return { authorizationUrl: await initializePaystack(input) };
  }
  async verify(payment: PaymentRecord, order: PreorderRecord) {
    const verified = await verifyPaystack(payment.providerReference);
    if (verified) validatePaymentMatch(payment, order, verified);
    return verified;
  }
}

const services: Record<string, PaymentService> = {
  bachs: new BachsPaymentService(),
  paystack: new PaystackPaymentService(),
};

export function getPaymentService(provider: string): PaymentService {
  if (!Object.hasOwn(services, provider))
    throw new PaymentError(
      'PAYMENT_PROVIDER_UNKNOWN',
      'Unknown payment provider.',
    );
  const service = services[provider];
  return {
    provider: service.provider,
    isConfigured: () => service.isConfigured(),
    initialize: (input) =>
      withSpan('payment.initialize', { 'payment.provider': provider }, () =>
        service.initialize(input),
      ),
    verify: (payment, order) =>
      withSpan(
        'payment.verify',
        { 'payment.provider': provider },
        async (span) => {
          const result = await service.verify(payment, order);
          span.setAttribute('payment.status', result?.status ?? 'not_found');
          return result;
        },
      ),
  };
}
