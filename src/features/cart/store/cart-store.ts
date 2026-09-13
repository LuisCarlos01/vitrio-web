import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  itemsBySlug: Record<string, CartItem[]>;
  addItem: (
    slug: string,
    item: Omit<CartItem, 'quantity'>,
    quantity: number,
  ) => void;
  setQuantity: (slug: string, productId: string, quantity: number) => void;
  removeItem: (slug: string, productId: string) => void;
  clear: (slug: string) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itemsBySlug: {},
      addItem: (slug, item, quantity) =>
        set((state) => {
          const items = state.itemsBySlug[slug] ?? [];
          const existing = items.find(
            (cartItem) => cartItem.productId === item.productId,
          );
          const nextItems = existing
            ? items.map((cartItem) =>
                cartItem.productId === item.productId
                  ? { ...item, quantity: cartItem.quantity + quantity }
                  : cartItem,
              )
            : [...items, { ...item, quantity }];

          return { itemsBySlug: { ...state.itemsBySlug, [slug]: nextItems } };
        }),
      setQuantity: (slug, productId, quantity) =>
        set((state) => {
          const items = state.itemsBySlug[slug] ?? [];
          const nextItems =
            quantity <= 0
              ? items.filter((item) => item.productId !== productId)
              : items.map((item) =>
                  item.productId === productId ? { ...item, quantity } : item,
                );

          return { itemsBySlug: { ...state.itemsBySlug, [slug]: nextItems } };
        }),
      removeItem: (slug, productId) =>
        set((state) => ({
          itemsBySlug: {
            ...state.itemsBySlug,
            [slug]: (state.itemsBySlug[slug] ?? []).filter(
              (item) => item.productId !== productId,
            ),
          },
        })),
      clear: (slug) =>
        set((state) => ({
          itemsBySlug: { ...state.itemsBySlug, [slug]: [] },
        })),
    }),
    { name: 'vitrio-cart' },
  ),
);
