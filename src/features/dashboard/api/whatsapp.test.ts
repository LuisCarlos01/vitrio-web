import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { updateWhatsappNumber, verifyWhatsapp } from './whatsapp';

const catalogDto = {
  id: 'catalog-1',
  name: 'Loja da Ana',
  slug: 'loja-da-ana',
  primaryColorHex: null,
  buttonColorHex: null,
  instagramHandle: null,
  whatsappNumber: '5511912345678',
  whatsappVerificationStatus: 'UNVERIFIED' as const,
  whatsappVerifiedAt: null,
  createdAt: '2025-12-01T00:00:00Z',
};

describe('updateWhatsappNumber', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a PUT with the given number and resolves with the updated catalog', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.put(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(catalogDto);
        },
      ),
    );

    const updated = await updateWhatsappNumber('catalog-1', '(11) 91234-5678');

    expect(receivedBody).toEqual({ whatsappNumber: '(11) 91234-5678' });
    expect(updated.whatsappNumber).toBe('5511912345678');
    expect(updated.isWhatsappVerified).toBe(false);
  });

  it('rejects without changing anything when the number is invalid', async () => {
    server.use(
      http.put(`${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp`, () =>
        HttpResponse.json(
          { message: 'Invalid WhatsApp number' },
          { status: 400 },
        ),
      ),
    );

    await expect(
      updateWhatsappNumber('catalog-1', 'not-a-number'),
    ).rejects.toThrow();
  });
});

describe('verifyWhatsapp', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a POST and resolves with the catalog marked as verified', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp/verify`,
        () =>
          HttpResponse.json({
            ...catalogDto,
            whatsappVerificationStatus: 'VERIFIED',
          }),
      ),
    );

    const verified = await verifyWhatsapp('catalog-1');

    expect(verified.isWhatsappVerified).toBe(true);
  });

  it('rejects with a clear error when there is no number configured', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp/verify`,
        () =>
          HttpResponse.json(
            { message: 'No WhatsApp number configured' },
            { status: 400 },
          ),
      ),
    );

    await expect(verifyWhatsapp('catalog-1')).rejects.toThrow();
  });
});
