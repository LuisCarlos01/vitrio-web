import type { CartItem } from '../store/cart-store';

export function buildWhatsappCheckoutUrl(
  whatsappNumber: string,
  items: CartItem[],
): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  const lines = items.map((item) => `${item.quantity}x ${item.name}`);
  const text = ['Olá! Tenho interesse nestes produtos:', ...lines].join('\n');

  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
