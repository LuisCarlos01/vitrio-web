import { describe, expect, it } from 'vitest';
import { buildWhatsappCheckoutUrl } from './build-whatsapp-checkout-url';

describe('buildWhatsappCheckoutUrl', () => {
  it('builds a wa.me link naming the store and listing each item as "quantity x name"', () => {
    const url = buildWhatsappCheckoutUrl('+5511999999999', 'Loja da Ana', [
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
          [
            'Olá! Gostaria de fazer o seguinte pedido na loja Loja da Ana:',
            '',
            '2x Eggeo Blossom',
            '1x Glamour Noir',
            '',
            'Aguardo a confirmação de disponibilidade e valores.',
          ].join('\n'),
        ),
    );
  });

  it('strips non-digit characters from the phone number', () => {
    const url = buildWhatsappCheckoutUrl('+55 (11) 99999-9999', 'Loja da Ana', [
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
    const url = buildWhatsappCheckoutUrl('+5511999999999', 'Loja da Ana', [
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
