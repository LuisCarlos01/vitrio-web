import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useUpdateProduct } from './use-update-product';

function renderUseUpdateProduct() {
  const queryClient = new QueryClient();
  return renderHook(() => useUpdateProduct(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useUpdateProduct', () => {
  it('only sends the fields explicitly passed, never reviving isVisible/isOrderable on its own', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products/p1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({
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
          });
        },
      ),
    );

    const { result } = renderUseUpdateProduct();

    // Reativa o produto sem tocar em isVisible/isOrderable — a UI não deve
    // enviar esses campos "de brinde" junto com isActive.
    result.current.mutate({
      catalogId: 'cat-1',
      id: 'p1',
      payload: { isActive: true },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedBody).toEqual({ isActive: true });
    expect(result.current.data?.isVisible).toBe(false);
    expect(result.current.data?.isOrderable).toBe(false);
  });
});
