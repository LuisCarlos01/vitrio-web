import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  name: string;
  imageUrl: string | null;
  quantityAvailable: number;
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
                  ? {
                      ...item,
                      quantity: Math.min(
                        cartItem.quantity + quantity,
                        item.quantityAvailable,
                      ),
                    }
                  : cartItem,
              )
            : [
                ...items,
                {
                  ...item,
                  quantity: Math.min(quantity, item.quantityAvailable),
                },
              ];

          return { itemsBySlug: { ...state.itemsBySlug, [slug]: nextItems } };
        }),
      setQuantity: (slug, productId, quantity) =>
        set((state) => {
          const items = state.itemsBySlug[slug] ?? [];
          const nextItems =
            quantity <= 0
              ? items.filter((item) => item.productId !== productId)
              : items.map((item) =>
                  item.productId === productId
                    ? {
                        ...item,
                        quantity: Math.min(quantity, item.quantityAvailable),
                      }
                    : item,
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
    {
      name: 'vitrio-cart',
      version: 2,
      // v0 guardava um `items: CartItem[]` global (sem escopo por loja) —
      // formato incompatível, não dá pra saber a que slug pertencia. v1 não
      // guardava `quantityAvailable` por item, então não dá pra aplicar o
      // limite de estoque num carrinho antigo sem reconsultar a API — mais
      // simples e seguro zerar do que arriscar permitir quantidade além do
      // estoque de novo.
      migrate: (): Pick<CartState, 'itemsBySlug'> => ({ itemsBySlug: {} }),
    },
  ),
);
