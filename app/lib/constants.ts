import type { BookSlide } from './types';

export const BOOK_IMAGES: BookSlide[] = [
  {
    src: '/assets/ritna4.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna1.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna2.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna3.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna5.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna6.jpg',
    alt: 'Rumbles in the New Academy',
  },
  {
    src: '/assets/ritna7.jpg',
    alt: 'Rumbles in the New Academy',
  },
];

export enum BookEdition {
  HARDCOVER = 'hardcover',
  SOFTCOVER = 'softcover',
  INSTITUTIONAL = 'institutional',
}

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT - Abuja',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export const SHIPPING_DEFAULT_VALUES = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: 'Lagos',
  note: '',
};

export const MODAL_MAX_WIDTHS = {
  sm: 'max-w-[400px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[800px]',
};

export const BOOK_LAUNCH_DATE = '2026-11-07T00:00:00';
export const COUNTDOWN_INTERVAL_MS = 1000;
export const CAROUSEL_INTERVAL_MS = 3000;
export const CART_STORAGE_KEY = 'ritna-cart';

export const WAITLIST_DEFAULT_VALUES = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  category: 'civilian' as const,
};

export const API_ENDPOINTS = {
  books: '/api/books',
  adminOverview: '/api/admin/overview',
  waitlist: '/api/waitlist',
  waitlistCount: '/api/waitlist/count',
  createPreorder: '/api/orders/pre-order',
} as const;

export const QUERY_KEYS = {
  books: ['getBooks'],
  adminStats: ['getAdminStats'],
  waitlistCount: ['getWaitlistCount'],
} as const;

export const MUTATION_KEYS = {
  joinWaitlist: ['join-waitlist'],
  createPreorder: ['create-preorder'],
} as const;

export const RANDOM_ID_CHARACTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
};

export const PAYSTACK_INITIALIZE_URL =
  'https://api.paystack.co/transaction/initialize';

export const CHECKOUT_ATTEMPT_STORAGE_KEY = 'ritna-checkout-attempt';

export const PAYSTACK_VERIFY_URL = 'https://api.paystack.co/transaction/verify';
