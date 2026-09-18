import type { CartItem } from '../store/cart-store';

export function buildWhatsappCheckoutUrl(
  whatsappNumber: string,
  storeName: string,
  items: CartItem[],
): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  const lines = items.map((item) => `${item.quantity}x ${item.name}`);
  const text = [
    `Olá! Gostaria de fazer o seguinte pedido na loja ${storeName}:`,
    '',
    ...lines,
    '',
    'Aguardo a confirmação de disponibilidade e valores.',
  ].join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
