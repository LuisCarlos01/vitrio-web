import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useUpdateCategory } from './use-update-category';

function renderUseUpdateCategory() {
  const queryClient = new QueryClient();
  return renderHook(() => useUpdateCategory(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useUpdateCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the updated category once the mutation succeeds', async () => {
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        () =>
          HttpResponse.json({
            id: 'category-1',
            catalogId: 'catalog-1',
            name: 'Cosméticos',
            createdAt: '2025-12-01T00:00:00Z',
          }),
      ),
    );

    const { result } = renderUseUpdateCategory();

    result.current.mutate({
      catalogId: 'catalog-1',
      id: 'category-1',
      payload: { name: 'Cosméticos' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe('Cosméticos');
  });
});
