import { describe, expect, it } from 'vitest';
import { buildWhatsappCheckoutUrl } from './build-whatsapp-checkout-url';

describe('buildWhatsappCheckoutUrl', () => {
  it('builds a wa.me link listing each item as "quantity x name"', () => {
    const url = buildWhatsappCheckoutUrl('+5511999999999', [
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 2,
      },
      {
        productId: 'prod-2',
        name: 'Glamour Noir',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 1,
      },
    ]);

    expect(url).toBe(
      'https://wa.me/5511999999999?text=' +
        encodeURIComponent(
          'Olá! Tenho interesse nestes produtos:\n2x Eggeo Blossom\n1x Glamour Noir',
        ),
    );
  });

  it('strips non-digit characters from the phone number', () => {
    const url = buildWhatsappCheckoutUrl('+55 (11) 99999-9999', [
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 1,
      },
    ]);

    expect(url.startsWith('https://wa.me/5511999999999?text=')).toBe(true);
  });

  it('never includes a price/currency marker in the message', () => {
    const url = buildWhatsappCheckoutUrl('+5511999999999', [
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantityAvailable: 10,
        quantity: 1,
      },
    ]);

    expect(decodeURIComponent(url)).not.toMatch(/R\$/);
  });
});
