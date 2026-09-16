export type EditionId = "hardcover" | "softcover";

export interface EditionConfig {
  id: EditionId;
  name: string;
  badgeText: string;
  price: number;
  image: string;
  description: string;
}

export type CartState = Record<EditionId, number>;

export interface BookSlide {
  src: string;
  alt: string;
}

