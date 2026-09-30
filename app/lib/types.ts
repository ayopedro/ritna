import { BookEdition } from "./constants";
export { BookEdition } from "./constants";

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

export interface AdminStats {
  orderCount: number;
  waitlistCount: number;
  reviewCount: number;
  orderRows: any[];
  waitlistRows: any[];
}