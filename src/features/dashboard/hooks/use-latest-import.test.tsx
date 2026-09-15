import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useLatestImport } from './use-latest-import';

function renderUseLatestImport(catalogId: string) {
  const queryClient = new QueryClient();
  return renderHook(() => useLatestImport(catalogId), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useLatestImport', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with null when the catalog never imported (204)', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/imports/latest`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderUseLatestImport('catalog-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});
