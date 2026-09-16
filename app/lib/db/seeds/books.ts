import { BookEdition } from '@/app/lib/types';
import type { books } from '../schema';

const booksSeed = [
  {
    id: '3514673a-4b58-5be3-a639-aab2f51d2c25',
    title: 'RITNA Hardcover',
    type: BookEdition.HARDCOVER,
    price: 35_000,
    image: '/assets/ritna4.jpg',
    description:
      'Premium print hardcover edition, shipped to your delivery address',
  },
  {
    id: '8b083824-b535-5215-91bb-74c574edd296',
    title: 'RITNA Softcover',
    type: BookEdition.SOFTCOVER,
    price: 25000,
    image: '/assets/ritna3.jpg',
    description:
      'Premium print softcover edition, shipped to your delivery address',
  },
  {
    id: 'b3c01e30-82f0-584a-84b9-8bd7559a0d8f',
    title: 'RITNA Institutional',
    type: BookEdition.INSTITUTIONAL,
    price: 0,
    image: '/assets/ritna_institutional.jpg',
    description:
      'Institutional edition for libraries and organizations, shipped to your delivery address',
  },
] satisfies (typeof books.$inferInsert)[];

export default booksSeed;
