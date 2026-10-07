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
    if (configuredProvider() === 'paystack')
      return Boolean(process.env.PAYSTACK_SECRET_KEY);
    return Boolean(
      /^sk_(sandbox|live)_/.test(process.env.BACHS_API_KEY ?? '') &&
      process.env.BACHS_CALLBACK_URL?.trim(),
    );
  } catch {
    return false;
  }
}
