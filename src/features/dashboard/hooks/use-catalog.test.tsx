import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useCatalog } from './use-catalog';

const catalogDto = {
  id: 'catalog-1',
  name: 'Loja da Ana',
  slug: 'loja-da-ana',
  primaryColorHex: null,
  buttonColorHex: null,
  instagramHandle: null,
  whatsappNumber: null,
  whatsappVerificationStatus: 'UNVERIFIED' as const,
  whatsappVerifiedAt: null,
  createdAt: '2025-12-01T00:00:00Z',
};

function renderUseCatalog() {
  const queryClient = new QueryClient();
  return renderHook(() => useCatalog(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useCatalog', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it("resolves with the account's single catalog (first item of the list)", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto]),
      ),
    );

    const { result } = renderUseCatalog();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.name).toBe('Loja da Ana');
  });

  it('resolves with null (not undefined) when the account has no catalog yet', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () => HttpResponse.json([])),
    );

    const { result } = renderUseCatalog();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeNull();
  });
});
