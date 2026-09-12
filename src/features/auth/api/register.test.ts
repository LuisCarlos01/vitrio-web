import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { register } from './register';

describe('register', () => {
  it('resolves with the session when the account is created', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' }),
      ),
    );

    const session = await register({
      email: 'new-reseller@example.com',
      password: 'correct-horse-battery',
    });

    expect(session).toEqual({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('rejects without inventing a session when the email is already taken', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json(
          { message: 'Email already registered' },
          { status: 409 },
        ),
      ),
    );

    await expect(
      register({
        email: 'existing@example.com',
        password: 'correct-horse-battery',
      }),
    ).rejects.toThrow();
  });
});
