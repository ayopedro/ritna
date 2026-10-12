import type { PaymentRecord, PreorderRecord } from '@/app/lib/types';
import type { PaymentProvider } from './configuration';

export interface CheckoutInput {
  email: string;
  name: string;
  amount: number;
  currency: string;
  reference: string;
  orderId: string;
}
export interface CheckoutResult {
  authorizationUrl: string;
  providerCheckoutId?: string;
}
export interface VerifiedPayment {
  status: string;
  paid_at?: string | null;
}
export interface PaymentService {
  readonly provider: PaymentProvider;
  isConfigured(): boolean;
  initialize(input: CheckoutInput): Promise<CheckoutResult>;
  verify(
    payment: PaymentRecord,
    order: PreorderRecord,
  ): Promise<VerifiedPayment | null>;
}
