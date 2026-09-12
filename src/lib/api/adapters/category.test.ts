import { describe, expect, it } from 'vitest';
import { toCategory } from './category';

describe('toCategory', () => {
  it('maps the raw category response body to a domain Category', () => {
    const apiResponseBody = {
      id: 'category-1',
      catalogId: 'catalog-1',
      name: 'Perfumes',
      createdAt: '2025-12-01T00:00:00Z',
    };

    expect(toCategory(apiResponseBody)).toEqual({
      id: 'category-1',
      name: 'Perfumes',
    });
  });
});
