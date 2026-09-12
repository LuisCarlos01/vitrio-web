import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useAuthStore } from '../store/auth-store';
import { useLogin } from './use-login';

function renderUseLogin() {
  const queryClient = new QueryClient();
  return renderHook(() => useLogin(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useLogin', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('saves the session in the auth store once the login mutation succeeds', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' }),
      ),
    );

    const { result } = renderUseLogin();

    result.current.mutate({
      email: 'reseller@example.com',
      password: 'correct-horse',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'abc',
      refreshToken: 'def',
      isAuthenticated: true,
    });
  });

  it('does not touch the auth store when the login mutation fails', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );

    const { result } = renderUseLogin();

    result.current.mutate({
      email: 'reseller@example.com',
      password: 'wrong',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
