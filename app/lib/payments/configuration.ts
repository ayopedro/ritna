import { getPaymentService } from './payment-service-factory';

export type PaymentProvider = 'bachs' | 'paystack';

export function configuredProvider(): PaymentProvider {
  const provider = process.env.PAYMENT_PROVIDER?.trim() || 'bachs';
  if (provider !== 'bachs' && provider !== 'paystack') {
    throw new Error('Invalid payment provider.');
  }
  return provider;
}

export function isPaymentConfigured(): boolean {
  try {
    return getPaymentService(configuredProvider()).isConfigured();
  } catch {
    return false;
  }
}
