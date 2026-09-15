import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { getLatestImport } from './csv-import-log';

describe('getLatestImport', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('resolves with the latest import mapped to the domain type when one exists', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/imports/latest`, () =>
        HttpResponse.json({
          catalogId: 'catalog-1',
          confirmedAt: '2026-09-10T12:00:00Z',
          acceptedCount: 8,
          rejectedCount: 2,
        }),
      ),
    );

    const log = await getLatestImport('catalog-1');

    expect(log).toEqual({
      catalogId: 'catalog-1',
      confirmedAt: '2026-09-10T12:00:00Z',
      acceptedCount: 8,
      rejectedCount: 2,
    });
  });

  it('resolves with null (not an error) when the API returns 204 — catalog never imported', async () => {
    server.use(
      http.get(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/imports/latest`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const log = await getLatestImport('catalog-1');

    expect(log).toBeNull();
  });
});
