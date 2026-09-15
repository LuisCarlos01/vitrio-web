import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useMe } from './use-me';

function renderUseMe() {
  const queryClient = new QueryClient();
  return renderHook(() => useMe(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useMe', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it("resolves with the authenticated account's data", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users/me`, () =>
        HttpResponse.json({
          id: 'user-1',
          email: 'ana@example.com',
          name: null,
        }),
      ),
    );

    const { result } = renderUseMe();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.email).toBe('ana@example.com');
  });
});
