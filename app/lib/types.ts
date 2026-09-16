export enum BookEdition {
  HARDCOVER = 'hardcover',
  SOFTCOVER = 'softcover',
  INSTITUTIONAL = 'institutional',
}

export interface Book {
  id: string;
  title: string;
  price: number;
  type: BookEdition;
  image: string | null;
  description: string | null;
}

export type CartState = Record<BookEdition, number>;

export interface BookSlide {
  src: string;
  alt: string;
}
