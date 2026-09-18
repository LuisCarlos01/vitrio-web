import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { server } from '@/mocks/server';
import { authenticatedFetch } from './authenticated-fetch';
import { API_BASE_URL } from './config';

describe('authenticatedFetch', () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it('attaches the access token from the auth store as a Bearer header', async () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc-123', refreshToken: 'refresh' });

    let receivedAuthHeader: string | null = null;
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, ({ request }) => {
        receivedAuthHeader = request.headers.get('authorization');
        return HttpResponse.json([]);
      }),
    );

    await authenticatedFetch('/api/v1/catalogs');

    expect(receivedAuthHeader).toBe('Bearer abc-123');
  });

  it('does not force a JSON content-type when the body is FormData', async () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc-123', refreshToken: 'refresh' });

    let receivedContentType: string | null = null;
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/assets`,
        ({ request }) => {
          receivedContentType = request.headers.get('content-type');
          return HttpResponse.json({});
        },
      ),
    );

    const formData = new FormData();
    formData.append('file', new Blob(['fake'], { type: 'image/png' }), 'p.png');

    await authenticatedFetch('/api/v1/catalogs/cat-1/assets', {
      method: 'POST',
      body: formData,
    });

    expect(receivedContentType).toMatch(/^multipart\/form-data/);
  });

  it('throws an ApiError with the response status when the request fails', async () => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc-123', refreshToken: 'refresh' });

    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json({ message: 'nope' }, { status: 403 }),
      ),
    );

    await expect(authenticatedFetch('/api/v1/catalogs')).rejects.toThrow();
  });

  it('refuses to send the Bearer token over plain HTTP in production', async () => {
    // API_BASE_URL neste ambiente de teste é http://localhost:8080 (default
    // de dev) — em produção isso significaria mandar o token em texto claro.
    vi.stubEnv('NODE_ENV', 'production');

    await expect(authenticatedFetch('/api/v1/catalogs')).rejects.toThrow(
      /https/i,
    );

    vi.unstubAllEnvs();
  });

  describe('on a 401 response', () => {
    it('refreshes the session and retries the request once with the new access token', async () => {
      useAuthStore
        .getState()
        .setSession({ accessToken: 'expired', refreshToken: 'refresh-1' });

      let attempt = 0;
      const receivedAuthHeaders: (string | null)[] = [];
      server.use(
        http.get(`${API_BASE_URL}/api/v1/catalogs`, ({ request }) => {
          attempt += 1;
          receivedAuthHeaders.push(request.headers.get('authorization'));
          return attempt === 1
            ? HttpResponse.json({ message: 'expired' }, { status: 401 })
            : HttpResponse.json([{ id: 'cat-1' }]);
        }),
        http.post(`${API_BASE_URL}/api/v1/auth/refresh`, () =>
          HttpResponse.json({
            accessToken: 'fresh',
            refreshToken: 'refresh-2',
          }),
        ),
      );

      const response = await authenticatedFetch('/api/v1/catalogs');

      expect(response.ok).toBe(true);
      expect(receivedAuthHeaders).toEqual(['Bearer expired', 'Bearer fresh']);
      expect(useAuthStore.getState().accessToken).toBe('fresh');
    });

    it('clears the session and throws when the refresh token is also invalid', async () => {
      useAuthStore
        .getState()
        .setSession({ accessToken: 'expired', refreshToken: 'refresh-1' });

      server.use(
        http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
          HttpResponse.json({ message: 'expired' }, { status: 401 }),
        ),
        http.post(`${API_BASE_URL}/api/v1/auth/refresh`, () =>
          HttpResponse.json({ message: 'invalid' }, { status: 401 }),
        ),
      );

      await expect(authenticatedFetch('/api/v1/catalogs')).rejects.toThrow();

      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });
});
