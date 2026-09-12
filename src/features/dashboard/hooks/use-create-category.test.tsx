import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useCreateCategory } from './use-create-category';

function renderUseCreateCategory() {
  const queryClient = new QueryClient();
  return renderHook(() => useCreateCategory(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useCreateCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the created category once the mutation succeeds', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json({
          id: 'category-1',
          catalogId: 'catalog-1',
          name: 'Perfumes',
          createdAt: '2025-12-01T00:00:00Z',
        }),
      ),
    );

    const { result } = renderUseCreateCategory();

    result.current.mutate({
      catalogId: 'catalog-1',
      payload: { name: 'Perfumes' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({ id: 'category-1', name: 'Perfumes' });
  });
});
