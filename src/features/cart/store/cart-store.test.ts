import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore } from './cart-store';

const STORAGE_KEY = 'vitrio-cart';
const SLUG_A = 'loja-da-ana';
const SLUG_B = 'loja-do-bruno';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ itemsBySlug: {} });
    localStorage.clear();
  });

  it('adds a new item with the given quantity, scoped to the store slug', () => {
    useCartStore.getState().addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 2,
      },
    ]);
  });

  it('keeps carts from different stores completely separate', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.addItem(
      SLUG_B,
      {
        productId: 'prod-9',
        name: 'Colônia do Bruno',
        imageUrl: null,
        quantityAvailable: 10,
      },
      1,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 2,
      },
    ]);
    expect(useCartStore.getState().itemsBySlug[SLUG_B]).toEqual([
      {
        productId: 'prod-9',
        name: 'Colônia do Bruno',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 1,
      },
    ]);
  });

  it('accumulates quantity when adding a product already in that store cart', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      3,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 5,
      },
    ]);
  });

  it('caps the accumulated quantity at the product stock, never exceeding it', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 5,
      },
      3,
    );
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 5,
      },
      4,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A][0].quantity).toBe(5);
  });

  it('caps a brand-new item at the product stock when the requested quantity exceeds it', () => {
    useCartStore.getState().addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 5,
      },
      999,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A][0].quantity).toBe(5);
  });

  it('refreshes the persisted name/imageUrl when adding an already-cart product again', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      1,
    );
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom Renomeado',
        imageUrl: 'https://cdn.example.com/eggeo-novo.png',
        quantityAvailable: 10,
      },
      1,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom Renomeado',
        imageUrl: 'https://cdn.example.com/eggeo-novo.png',
        quantityAvailable: 10,
        quantity: 2,
      },
    ]);
  });

  it("adding a product to store B does not touch store A's cart, even with the same productId", () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.addItem(
      SLUG_B,
      {
        productId: 'prod-1',
        name: 'Perfume Homônimo',
        imageUrl: null,
        quantityAvailable: 10,
      },
      5,
    );

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 2,
      },
    ]);
  });

  it('sets an absolute quantity for an item already in that store cart', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.setQuantity(SLUG_A, 'prod-1', 7);

    expect(useCartStore.getState().itemsBySlug[SLUG_A][0].quantity).toBe(7);
  });

  it('caps an absolute quantity set via setQuantity at the product stock', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 5,
      },
      2,
    );
    store.setQuantity(SLUG_A, 'prod-1', 999);

    expect(useCartStore.getState().itemsBySlug[SLUG_A][0].quantity).toBe(5);
  });

  it('removes the item when setQuantity is called with 0', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.setQuantity(SLUG_A, 'prod-1', 0);

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([]);
  });

  it('removes an item explicitly via removeItem, scoped to the store slug', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.removeItem(SLUG_A, 'prod-1');

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([]);
  });

  it('clears every item of a single store via clear, leaving other stores untouched', () => {
    const store = useCartStore.getState();
    store.addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );
    store.addItem(
      SLUG_B,
      {
        productId: 'prod-9',
        name: 'Colônia do Bruno',
        imageUrl: null,
        quantityAvailable: 10,
      },
      1,
    );
    store.clear(SLUG_A);

    expect(useCartStore.getState().itemsBySlug[SLUG_A]).toEqual([]);
    expect(useCartStore.getState().itemsBySlug[SLUG_B]).toEqual([
      {
        productId: 'prod-9',
        name: 'Colônia do Bruno',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 1,
      },
    ]);
  });

  it('persists items to localStorage, namespaced by store slug, so the cart survives a reload', () => {
    useCartStore.getState().addItem(
      SLUG_A,
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
      },
      2,
    );

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

    expect(persisted?.state?.itemsBySlug?.[SLUG_A]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 2,
      },
    ]);
  });

  it('migrates a legacy (pre-slug) persisted cart to an empty itemsBySlug map instead of crashing', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          items: [
            {
              productId: 'old-1',
              name: 'Produto antigo',
              imageUrl: null,
              quantity: 3,
            },
          ],
        },
        version: 0,
      }),
    );

    vi.resetModules();
    const { useCartStore: rehydratedStore } = await import('./cart-store');

    expect(rehydratedStore.getState().itemsBySlug).toEqual({});
  });

  it('migrates a pre-stock-cap persisted cart (v1, no quantityAvailable) to an empty itemsBySlug map', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          itemsBySlug: {
            [SLUG_A]: [
              {
                productId: 'prod-1',
                name: 'Eggeo Blossom',
                imageUrl: null,
                quantity: 3,
              },
            ],
          },
        },
        version: 1,
      }),
    );

    vi.resetModules();
    const { useCartStore: rehydratedStore } = await import('./cart-store');

    expect(rehydratedStore.getState().itemsBySlug).toEqual({});
  });
});
