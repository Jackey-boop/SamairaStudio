import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  name: string;
  image: string;
  price: number; // paise
  quantity: number;
  stock: number;
}

interface CartState {
  items: CartItem[];
  hasHydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  increment: (productId: string) => void;
  decrement: (productId: string) => void;
  clear: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId
          );
          const cap = item.stock > 0 ? item.stock : Infinity;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: Math.min(i.quantity + quantity, cap) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, cap) },
            ],
          };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? {
                    ...i,
                    quantity: Math.max(
                      1,
                      i.stock > 0 ? Math.min(quantity, i.stock) : quantity
                    ),
                  }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      increment: (productId) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity:
                    i.stock > 0 ? Math.min(i.quantity + 1, i.stock) : i.quantity + 1,
                }
              : i
          ),
        })),

      decrement: (productId) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.productId === productId
                ? { ...i, quantity: i.quantity - 1 }
                : i
            )
            .filter((i) => i.quantity > 0),
        })),

      clear: () => set({ items: [] }),

      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "samaira-cart",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Derived selectors (use with useCart(selector) for minimal re-renders).
export const selectCount = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
