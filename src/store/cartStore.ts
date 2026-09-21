import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // The item ID from Supabase
  name: string;
  brand: string;
  category: string;
  qty: number;
  rate_cents: number;
  image?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalCostCents: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      
      addToCart: (item) => {
        set((state) => {
          const existingItem = state.items[item.id];
          if (existingItem) {
            return {
              items: {
                ...state.items,
                [item.id]: {
                  ...existingItem,
                  qty: existingItem.qty + 1,
                },
              },
            };
          } else {
            return {
              items: {
                ...state.items,
                [item.id]: {
                  ...item,
                  qty: 1,
                },
              },
            };
          }
        });
      },
      
      removeFromCart: (id) => {
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems };
        });
      },
      
      updateQuantity: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          items: {
            ...state.items,
            [id]: {
              ...state.items[id],
              qty,
            },
          },
        }));
      },
      
      clearCart: () => {
        set({ items: {} });
      },
      
      getTotalItems: () => {
        const state = get();
        return Object.values(state.items).reduce((total, item) => total + item.qty, 0);
      },
      
      getTotalCostCents: () => {
        const state = get();
        return Object.values(state.items).reduce((total, item) => total + (item.rate_cents * item.qty), 0);
      }
    }),
    {
      name: 'djm-cart-storage', // unique name for localStorage
    }
  )
);
