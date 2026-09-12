import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useUpdateCatalog } from './use-update-catalog';

function renderUseUpdateCatalog() {
  const queryClient = new QueryClient();
  return renderHook(() => useUpdateCatalog(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useUpdateCatalog', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the updated catalog once the mutation succeeds', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, () =>
        HttpResponse.json({
          id: 'catalog-1',
          name: 'Loja Nova',
          slug: 'loja-da-ana',
          primaryColorHex: null,
          buttonColorHex: null,
          instagramHandle: null,
          whatsappNumber: null,
          whatsappVerificationStatus: 'UNVERIFIED',
          whatsappVerifiedAt: null,
          createdAt: '2025-12-01T00:00:00Z',
        }),
      ),
    );

    const { result } = renderUseUpdateCatalog();

    result.current.mutate({ id: 'catalog-1', payload: { name: 'Loja Nova' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe('Loja Nova');
  });
});
