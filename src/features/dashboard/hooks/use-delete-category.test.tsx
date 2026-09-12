import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useDeleteCategory } from './use-delete-category';

function renderUseDeleteCategory() {
  const queryClient = new QueryClient();
  return renderHook(() => useDeleteCategory(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useDeleteCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('succeeds once the mutation resolves', async () => {
    server.use(
      http.delete(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        () => HttpResponse.json({}),
      ),
    );

    const { result } = renderUseDeleteCategory();

    result.current.mutate({ catalogId: 'catalog-1', id: 'category-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
