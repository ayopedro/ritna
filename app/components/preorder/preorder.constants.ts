import { BookSlide } from '../../lib/types';

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

export const formatPrice = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};
