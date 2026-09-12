import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useVerifyWhatsapp } from './use-verify-whatsapp';

function renderUseVerifyWhatsapp() {
  const queryClient = new QueryClient();
  return renderHook(() => useVerifyWhatsapp(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useVerifyWhatsapp', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the catalog marked as verified once the mutation succeeds', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp/verify`,
        () =>
          HttpResponse.json({
            id: 'catalog-1',
            name: 'Loja da Ana',
            slug: 'loja-da-ana',
            primaryColorHex: null,
            buttonColorHex: null,
            instagramHandle: null,
            whatsappNumber: '5511912345678',
            whatsappVerificationStatus: 'VERIFIED',
            whatsappVerifiedAt: '2025-12-02T00:00:00Z',
            createdAt: '2025-12-01T00:00:00Z',
          }),
      ),
    );

    const { result } = renderUseVerifyWhatsapp();

    result.current.mutate({ catalogId: 'catalog-1' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.isWhatsappVerified).toBe(true);
  });
});
