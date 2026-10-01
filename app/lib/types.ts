import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { BookEdition } from './constants';
export { BookEdition } from './constants';

export interface Book {
  id: string;
  title: string;
  price: number;
  type: BookEdition;
  image: string | null;
  description: string | null;
}

export interface BookSlide {
  src: string;
  alt: string;
}

export interface AdminStats {
  orderCount: number;
  waitlistCount: number;
  reviewCount: number;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  note?: string;
}

export interface ShippingModalProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
}

export interface EditionCardProps {
  book: Book;
}

export interface EditionListProps {
  books: Book[];
  isLoading: boolean;
}

export interface MobileCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemCount: number;
  total: number;
  children: ReactNode;
}

export interface SelectedBook {
  book: Book;
  quantity: number;
}

export interface OrderSummaryProps {
  selectedBooks: SelectedBook[];
  total: number;
  onPayNow: () => void;
  variant?: 'sidebar' | 'drawer';
}

export type JoinWaitlistFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  category: 'civilian' | 'military';
};

export type CreatePreorderFormData = {
  items: CartItem[];
  customer: ShippingDetails;
  totalAmount: number;
};

export interface CartItem {
  id: string;
  quantity: number;
}

export interface CartAction {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export interface CartStore {
  items: CartItem[];
}

export type CartState = CartStore & CartAction;

export interface PaystackCheckoutInput {
  email: string;
  amount: number;
  reference: string;
  orderId: string;
}

export type ValidatedPreorder = import('zod').infer<
  typeof import('./validators').createPreorderSchema
>;
export type PreorderRecord = typeof import('./db/schema').orders.$inferSelect;

export type PaymentRecord = typeof import('./db/schema').payments.$inferSelect;
export type VerifiedPaystackPayment = import('zod').infer<
  typeof import('./validators').paystackVerifyResponseSchema
>['data'];

export interface PaymentResultPageProps {
  searchParams: Promise<{ reference?: string }>;
}

export interface ConfirmationEmailPayload {
  from: string;
  to: string[];
  reply_to: string;
  subject: string;
  text: string;
}

export interface ConfirmationEmailItem {
  title: string;
  quantity: number;
  unitPrice: number;
}

export interface LogContext {
  requestId: string;
  route: string;
  method: string;
}
export interface LogFields {
  status?: number;
  durationMs?: number;
  orderId?: string;
  paymentId?: string;
  provider?: string;
  errorType?: string;
  errorCode?: string;
}

export interface AdminOrderRow {
  id: string;
  status: PreorderRecord['status'];
  paymentStatus: PreorderRecord['paymentStatus'];
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string | null;
}

export interface AdminWaitlistRow {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  category: 'civilian' | 'military';
  createdAt: string | null;
}

export interface AdminTableRecord {
  id: string;
  email: string;
}

export interface AdminDataTableProps<T extends AdminTableRecord> {
  title: string;
  kind: 'orders' | 'waitlist';
  columns: import('@tanstack/react-table').ColumnDef<T>[];
}

export interface SelectionCheckboxProps {
  label: string;
  checked: boolean;
  mixed?: boolean;
  onChange: (checked: boolean) => void;
}


export type AdminRecordsQuery = import('zod').infer<typeof import('./validators').adminRecordsQuerySchema>;
export interface AdminRecordsPage<T> { rows: T[]; totalCount: number; page: number; pageSize: number; }
export type AdminBulkSelection = { mode: 'explicit'; records: Record<string, string> } | { mode: 'all'; search: string; totalCount: number; excluded: Record<string, true> };
