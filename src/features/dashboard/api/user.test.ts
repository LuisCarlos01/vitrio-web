import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { getMe, updateMe } from './user';

describe('getMe', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it("resolves with the authenticated account's data mapped to the domain type", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/users/me`, () =>
        HttpResponse.json({
          id: 'user-1',
          email: 'ana@example.com',
          name: null,
        }),
      ),
    );

    const me = await getMe();

    expect(me).toEqual({ id: 'user-1', email: 'ana@example.com', name: null });
  });
});

describe('updateMe', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a PATCH with the given name and resolves with the updated account', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/users/me`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({
          id: 'user-1',
          email: 'ana@example.com',
          name: 'Ana Souza',
        });
      }),
    );

    const updated = await updateMe({ name: 'Ana Souza' });

    expect(receivedBody).toEqual({ name: 'Ana Souza' });
    expect(updated.name).toBe('Ana Souza');
  });
});
