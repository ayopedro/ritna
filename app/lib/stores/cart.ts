
import { CART_STORAGE_KEY } from "@/lib/constants";
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  quantity: number;
}

interface CartAction {
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

interface CartStore {
  items: CartItem[];
}

export type CartState = CartStore & CartAction;

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        clearCart: () => set({ items: [] }),
        addItem: (item: CartItem) =>
          set((state) => {
            const index = state.items.findIndex((i) => i.id === item.id);
            const quantity = item.quantity ?? 1;
            const items = [...state.items];

            if (index === -1) {
              items.push({ ...item, quantity });
            } else {
              items[index] = {
                ...items[index],
                quantity: items[index].quantity + quantity,
              };
            }

            return { items };
          }),
        removeItem: (id: string) =>
          set((state) => {
            const index = state.items.findIndex((item) => item.id === id);
            if (index === -1) return state;

            const items = [...state.items];
            const item = items[index];

            if (item.quantity > 1) {
              items[index] = { ...item, quantity: item.quantity - 1 };
            } else {
              items.splice(index, 1);
            }

            return { items };
          }),
      }),
      { name: CART_STORAGE_KEY },
    ),
  ),
);
