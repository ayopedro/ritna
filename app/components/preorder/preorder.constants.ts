import { EditionConfig, EditionId, BookSlide } from "./types";

export const HARDCOVER_PRICE = 35000;
export const SOFTCOVER_PRICE = 25000;
export const DELIVERY_FEE = 5000;

export const EDITIONS: Record<EditionId, EditionConfig> = {
  hardcover: {
    id: "hardcover",
    name: "RITNA Hardcover",
    badgeText: "HARDCOVER",
    price: HARDCOVER_PRICE,
    image: "/assets/ritna4.jpg",
    description:
      "Premium print hardcover edition, shipped to your delivery address",
  },
  softcover: {
    id: "softcover",
    name: "RITNA Softcover",
    badgeText: "SOFTCOVER",
    price: SOFTCOVER_PRICE,
    image: "/assets/ritna3.jpg",
    description:
      "Premium print softcover edition, shipped to your delivery address",
  },
};

export const BOOK_IMAGES: BookSlide[] = [
  {
    src: "/assets/ritna4.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna1.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna2.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna3.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna5.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna6.jpg",
    alt: "Rumbles in the New Academy",
  },
  {
    src: "/assets/ritna7.jpg",
    alt: "Rumbles in the New Academy",
  },
];

export const formatPrice = (amount: number): string => {
  return `₦${amount.toLocaleString()}`;
};

