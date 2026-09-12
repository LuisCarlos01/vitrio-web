import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useCreateCatalog } from './use-create-catalog';

function renderUseCreateCatalog() {
  const queryClient = new QueryClient();
  return renderHook(() => useCreateCatalog(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useCreateCatalog', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the newly created catalog', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json({
          id: 'catalog-1',
          name: 'Loja da Ana',
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

    const { result } = renderUseCreateCatalog();

    result.current.mutate({ name: 'Loja da Ana' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe('Loja da Ana');
  });
});
