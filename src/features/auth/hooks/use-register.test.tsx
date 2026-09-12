import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { useAuthStore } from '../store/auth-store';
import { useRegister } from './use-register';

function renderUseRegister() {
  const queryClient = new QueryClient();
  return renderHook(() => useRegister(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
}

describe('useRegister', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('saves the session in the auth store once the register mutation succeeds', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' }),
      ),
    );

    const { result } = renderUseRegister();

    result.current.mutate({
      email: 'new-reseller@example.com',
      password: 'correct-horse-battery',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'abc',
      refreshToken: 'def',
      isAuthenticated: true,
    });
  });

  it('does not touch the auth store when the register mutation fails', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json(
          { message: 'Email already registered' },
          { status: 409 },
        ),
      ),
    );

    const { result } = renderUseRegister();

    result.current.mutate({
      email: 'existing@example.com',
      password: 'correct-horse-battery',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
