import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from './cart-store';

const STORAGE_KEY = 'vitrio-cart';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
    localStorage.clear();
  });

  it('adds a new item with the given quantity', () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    expect(useCartStore.getState().items).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantity: 2,
      },
    ]);
  });

  it('accumulates quantity when adding a product already in the cart', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      2,
    );
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      3,
    );

    expect(useCartStore.getState().items).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantity: 5,
      },
    ]);
  });

  it('refreshes the persisted name/imageUrl when adding an already-cart product again', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      1,
    );
    store.addItem(
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom Renomeado',
        imageUrl: 'https://cdn.example.com/eggeo-novo.png',
      },
      1,
    );

    expect(useCartStore.getState().items).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom Renomeado',
        imageUrl: 'https://cdn.example.com/eggeo-novo.png',
        quantity: 2,
      },
    ]);
  });

  it('sets an absolute quantity for an item already in the cart', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      2,
    );
    store.setQuantity('prod-1', 7);

    expect(useCartStore.getState().items[0].quantity).toBe(7);
  });

  it('removes the item when setQuantity is called with 0', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      2,
    );
    store.setQuantity('prod-1', 0);

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('removes an item explicitly via removeItem', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      2,
    );
    store.removeItem('prod-1');

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('clears every item via clear', () => {
    const store = useCartStore.getState();
    store.addItem(
      { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
      2,
    );
    store.addItem(
      { productId: 'prod-2', name: 'Glamour Noir', imageUrl: null },
      1,
    );
    store.clear();

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('persists items to localStorage so the cart survives a reload', () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');

    expect(persisted?.state?.items).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantity: 2,
      },
    ]);
  });
});
