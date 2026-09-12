import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useUpdateWhatsapp } from './use-update-whatsapp';

function renderUseUpdateWhatsapp() {
  const queryClient = new QueryClient();
  return renderHook(() => useUpdateWhatsapp(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useUpdateWhatsapp', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the updated catalog once the mutation succeeds', async () => {
    server.use(
      http.put(`${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp`, () =>
        HttpResponse.json({
          id: 'catalog-1',
          name: 'Loja da Ana',
          slug: 'loja-da-ana',
          primaryColorHex: null,
          buttonColorHex: null,
          instagramHandle: null,
          whatsappNumber: '5511912345678',
          whatsappVerificationStatus: 'UNVERIFIED',
          whatsappVerifiedAt: null,
          createdAt: '2025-12-01T00:00:00Z',
        }),
      ),
    );

    const { result } = renderUseUpdateWhatsapp();

    result.current.mutate({
      catalogId: 'catalog-1',
      whatsappNumber: '(11) 91234-5678',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.whatsappNumber).toBe('5511912345678');
  });
});
