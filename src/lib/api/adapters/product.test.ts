import { describe, expect, it } from 'vitest';
import { toProduct } from './product';

describe('toProduct', () => {
  it('maps the raw product response body to a domain Product', () => {
    const apiResponseBody = {
      id: 'p1',
      catalogId: 'cat1',
      name: 'Perfume X',
      sku: 'PRF-001',
      description: 'Cheiro bom',
      imageAssetId: 'asset1',
      categoryId: 'cat-perfumes',
      quantityAvailable: 5,
      isVisible: true,
      isOrderable: true,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(toProduct(apiResponseBody)).toEqual({
      id: 'p1',
      name: 'Perfume X',
      sku: 'PRF-001',
      description: 'Cheiro bom',
      imageAssetId: 'asset1',
      categoryId: 'cat-perfumes',
      quantityAvailable: 5,
      isVisible: true,
      isOrderable: true,
      isActive: true,
      createdAt: '2026-01-01T00:00:00Z',
    });
  });
});
