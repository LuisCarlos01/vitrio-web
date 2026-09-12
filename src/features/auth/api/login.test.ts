import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { login } from './login';

describe('login', () => {
  it('resolves with the session when credentials are valid', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({
          accessToken: 'abc',
          refreshToken: 'def',
        }),
      ),
    );

    const session = await login({
      email: 'reseller@example.com',
      password: 'correct-horse',
    });

    expect(session).toEqual({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('rejects without inventing a session when credentials are invalid', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );

    await expect(
      login({ email: 'reseller@example.com', password: 'wrong' }),
    ).rejects.toThrow();
  });
});
