import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { createCatalog, getCatalogs, updateCatalog } from './catalog';

const catalogDto = {
  id: 'catalog-1',
  name: 'Loja da Ana',
  slug: 'loja-da-ana',
  primaryColorHex: '#FF00FF',
  buttonColorHex: '#00FF00',
  instagramHandle: 'lojadaana',
  whatsappNumber: null,
  whatsappVerificationStatus: 'UNVERIFIED' as const,
  whatsappVerifiedAt: null,
  createdAt: '2025-12-01T00:00:00Z',
};

describe('getCatalogs', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it("resolves with the account's catalogs mapped to the domain type", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto]),
      ),
    );

    const catalogs = await getCatalogs();

    expect(catalogs).toEqual([
      {
        id: 'catalog-1',
        name: 'Loja da Ana',
        slug: 'loja-da-ana',
        primaryColorHex: '#FF00FF',
        buttonColorHex: '#00FF00',
        instagramHandle: 'lojadaana',
        whatsappNumber: null,
        isWhatsappVerified: false,
        whatsappVerifiedAt: null,
      },
    ]);
  });
});

describe('createCatalog', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a POST with the given name and resolves with the created catalog', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json(catalogDto);
      }),
    );

    const created = await createCatalog({ name: 'Loja da Ana' });

    expect(receivedBody).toEqual({ name: 'Loja da Ana' });
    expect(created.id).toBe('catalog-1');
  });
});

describe('updateCatalog', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a PATCH with the given fields and resolves with the updated catalog', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...catalogDto, name: 'Loja Nova' });
        },
      ),
    );

    const updated = await updateCatalog('catalog-1', { name: 'Loja Nova' });

    expect(receivedBody).toEqual({ name: 'Loja Nova' });
    expect(updated.name).toBe('Loja Nova');
  });

  it('rejects when the API returns a validation error', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, () =>
        HttpResponse.json({ message: 'invalid color' }, { status: 400 }),
      ),
    );

    await expect(
      updateCatalog('catalog-1', { primaryColorHex: 'not-a-color' }),
    ).rejects.toThrow();
  });
});
