import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from './nav-items';

describe('NAV_ITEMS', () => {
  it('has all 5 destinations from ADR 0001, each with a unique href', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);

    expect(hrefs).toEqual([
      '/dashboard',
      '/products',
      '/store',
      '/whatsapp',
      '/categories',
    ]);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('marks exactly the 4 items from the mobile bottom tab bar spec as mobile', () => {
    const mobileLabels = NAV_ITEMS.filter((item) => item.mobile).map(
      (item) => item.label,
    );

    expect(mobileLabels).toEqual(['Catálogo', 'Produtos', 'Loja', 'WhatsApp']);
  });

  it('excludes Categorias from the mobile bar (reached via Produtos per ADR 0002)', () => {
    const categorias = NAV_ITEMS.find((item) => item.href === '/categories');

    expect(categorias?.mobile).toBe(false);
  });
});
