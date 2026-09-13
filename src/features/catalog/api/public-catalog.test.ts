import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { getPublicCatalog } from './public-catalog';

const catalogDto = {
  name: 'Loja da Ana',
  primaryColorHex: '#DB2777',
  buttonColorHex: '#7C3AED',
  instagramHandle: 'lojadaana',
  whatsappNumber: null,
  categories: [],
  products: [],
};

describe('getPublicCatalog', () => {
  it('resolves with the public catalog mapped to the domain type', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/public/catalogs/loja-da-ana`, () =>
        HttpResponse.json(catalogDto),
      ),
    );

    const catalog = await getPublicCatalog('loja-da-ana');

    expect(catalog).toEqual({
      name: 'Loja da Ana',
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
      instagramHandle: 'lojadaana',
      whatsappNumber: null,
      categories: [],
      products: [],
    });
  });

  it('does not send an Authorization header (public route)', async () => {
    let receivedAuthHeader: string | null = null;
    server.use(
      http.get(
        `${API_BASE_URL}/api/v1/public/catalogs/loja-da-ana`,
        ({ request }) => {
          receivedAuthHeader = request.headers.get('Authorization');
          return HttpResponse.json(catalogDto);
        },
      ),
    );

    await getPublicCatalog('loja-da-ana');

    expect(receivedAuthHeader).toBeNull();
  });

  it('throws an ApiError with status 404 when the slug does not exist', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/public/catalogs/unknown`, () =>
        HttpResponse.json({ message: 'not found' }, { status: 404 }),
      ),
    );

    await expect(getPublicCatalog('unknown')).rejects.toMatchObject({
      status: 404,
    });
    await expect(getPublicCatalog('unknown')).rejects.toBeInstanceOf(ApiError);
  });
});
