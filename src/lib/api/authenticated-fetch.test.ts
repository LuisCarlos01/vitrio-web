import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
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
});
