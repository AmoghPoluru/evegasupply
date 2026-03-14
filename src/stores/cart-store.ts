import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  product: {
    id: string;
    title: string;
    unitPrice: number;
    moq: number;
    images?: Array<{ id: string; url?: string }>;
  };
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: CartItem['product'], quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product, quantity) => {
        const items = get().items;
        const existingItem = items.find((item) => item.productId === product.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                productId: product.id,
                product,
                quantity,
              },
            ],
          });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        const item = get().items.find((item) => item.productId === productId);
        if (item && quantity < item.product.moq) {
          // Don't allow quantity below MOQ
          return;
        }
        
        set({
          items: get().items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.unitPrice * item.quantity,
          0
        );
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
