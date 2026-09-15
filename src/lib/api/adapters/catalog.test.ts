import { describe, expect, it } from 'vitest';
import { toCatalog } from './catalog';

describe('toCatalog', () => {
  it('maps the raw catalog response body to a domain Catalog', () => {
    const apiResponseBody = {
      id: 'catalog-1',
      name: 'Loja da Ana',
      slug: 'loja-da-ana',
      primaryColorHex: '#FF00FF',
      buttonColorHex: '#00FF00',
      hasCustomColor: true,
      instagramHandle: 'lojadaana',
      whatsappNumber: '+5511999999999',
      whatsappVerificationStatus: 'VERIFIED' as const,
      whatsappVerifiedAt: '2026-01-01T00:00:00Z',
      logoUrl: 'https://cdn.example.com/logo.png',
      createdAt: '2025-12-01T00:00:00Z',
    };

    expect(toCatalog(apiResponseBody)).toEqual({
      id: 'catalog-1',
      name: 'Loja da Ana',
      slug: 'loja-da-ana',
      primaryColorHex: '#FF00FF',
      buttonColorHex: '#00FF00',
      hasCustomColor: true,
      instagramHandle: 'lojadaana',
      whatsappNumber: '+5511999999999',
      isWhatsappVerified: true,
      whatsappVerifiedAt: '2026-01-01T00:00:00Z',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
  });

  it('maps an unverified WhatsApp status to isWhatsappVerified: false', () => {
    const apiResponseBody = {
      id: 'catalog-1',
      name: 'Loja da Ana',
      slug: 'loja-da-ana',
      primaryColorHex: null,
      buttonColorHex: null,
      hasCustomColor: false,
      instagramHandle: null,
      whatsappNumber: null,
      whatsappVerificationStatus: 'UNVERIFIED' as const,
      whatsappVerifiedAt: null,
      logoUrl: null,
      createdAt: '2025-12-01T00:00:00Z',
    };

    expect(toCatalog(apiResponseBody).isWhatsappVerified).toBe(false);
    expect(toCatalog(apiResponseBody).whatsappVerifiedAt).toBeNull();
    expect(toCatalog(apiResponseBody).logoUrl).toBeNull();
  });
});
