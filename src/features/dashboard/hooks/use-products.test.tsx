import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useProducts } from './use-products';

function renderUseProducts(catalogId: string) {
  const queryClient = new QueryClient();
  return renderHook(() => useProducts(catalogId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useProducts', () => {
  it('resolves with the products of the given catalog', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/cat-1/products`, () =>
        HttpResponse.json([
          {
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
          },
        ]),
      ),
    );

    const { result } = renderUseProducts('cat-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
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
