import { describe, expect, it } from 'vitest';
import { toPublicCatalog } from './public-catalog';

describe('toPublicCatalog', () => {
  it('maps the raw public catalog response body to a domain PublicCatalog', () => {
    const apiResponseBody = {
      name: 'Loja da Ana',
      logoUrl: 'https://cdn.example.com/logo.png',
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
      instagramHandle: 'lojadaana',
      whatsappNumber: '+5511999999999',
      categories: [{ id: 'cat-1', name: 'Perfumes' }],
      products: [
        {
          id: 'prod-1',
          name: 'Eggeo Blossom',
          sku: 'EGG-01',
          description: 'Floral suave',
          imageUrl: 'https://cdn.example.com/eggeo.png',
          categoryId: 'cat-1',
          quantityAvailable: 5,
          isOrderable: true,
        },
      ],
    };

    expect(toPublicCatalog(apiResponseBody)).toEqual({
      name: 'Loja da Ana',
      logoUrl: 'https://cdn.example.com/logo.png',
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
      instagramHandle: 'lojadaana',
      whatsappNumber: '+5511999999999',
      categories: [{ id: 'cat-1', name: 'Perfumes' }],
      products: [
        {
          id: 'prod-1',
          name: 'Eggeo Blossom',
          sku: 'EGG-01',
          description: 'Floral suave',
          imageUrl: 'https://cdn.example.com/eggeo.png',
          categoryId: 'cat-1',
          quantityAvailable: 5,
          isOrderable: true,
        },
      ],
    });
  });

  it('maps a null whatsappNumber (unverified store) and null instagramHandle', () => {
    const apiResponseBody = {
      name: 'Loja da Ana',
      logoUrl: null,
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
      instagramHandle: null,
      whatsappNumber: null,
      categories: [],
      products: [],
    };

    const catalog = toPublicCatalog(apiResponseBody);

    expect(catalog.whatsappNumber).toBeNull();
    expect(catalog.instagramHandle).toBeNull();
  });

  it('maps a null logoUrl when the store has no logo', () => {
    const apiResponseBody = {
      name: 'Loja da Ana',
      logoUrl: null,
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
      instagramHandle: null,
      whatsappNumber: null,
      categories: [],
      products: [],
    };

    expect(toPublicCatalog(apiResponseBody).logoUrl).toBeNull();
  });
});
