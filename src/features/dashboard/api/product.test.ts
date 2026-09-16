import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from './product';

const rawProduct = {
  id: 'p1',
  catalogId: 'cat-1',
  name: 'Perfume X',
  sku: null,
  description: null,
  imageUrl: 'https://cdn.example.com/asset1.png',
  categoryId: null,
  quantityAvailable: 0,
  isVisible: false,
  isOrderable: false,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('getProducts', () => {
  it('resolves with the list of products for the catalog', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/cat-1/products`, () =>
        HttpResponse.json([rawProduct]),
      ),
    );

    const products = await getProducts('cat-1');

    expect(products).toEqual([
      {
        id: 'p1',
        name: 'Perfume X',
        sku: null,
        description: null,
        imageUrl: 'https://cdn.example.com/asset1.png',
        categoryId: null,
        quantityAvailable: 0,
        isVisible: false,
        isOrderable: false,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
      },
    ]);
  });
});

describe('createProduct', () => {
  it('sends the payload and resolves with the created product', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(rawProduct, { status: 201 });
        },
      ),
    );

    const product = await createProduct('cat-1', {
      name: 'Perfume X',
      imageAssetId: 'asset1',
    });

    expect(receivedBody).toEqual({ name: 'Perfume X', imageAssetId: 'asset1' });
    expect(product.id).toBe('p1');
  });

  it('rejects with a duplicate-SKU error without inventing a product', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/cat-1/products`, () =>
        HttpResponse.json({ message: 'SKU already in use' }, { status: 409 }),
      ),
    );

    await expect(
      createProduct('cat-1', { name: 'Perfume X', imageAssetId: 'asset1' }),
    ).rejects.toThrow();
  });
});

describe('updateProduct', () => {
  it('sends only the changed fields and resolves with the updated product', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products/p1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...rawProduct, isActive: true });
        },
      ),
    );

    await updateProduct('cat-1', 'p1', { isActive: true });

    expect(receivedBody).toEqual({ isActive: true });
  });
});

describe('deleteProduct', () => {
  it('sends a DELETE request for the product', async () => {
    server.use(
      http.delete(`${API_BASE_URL}/api/v1/catalogs/cat-1/products/p1`, () =>
        HttpResponse.json(null, { status: 204 }),
      ),
    );

    await expect(deleteProduct('cat-1', 'p1')).resolves.toBeUndefined();
  });
});
