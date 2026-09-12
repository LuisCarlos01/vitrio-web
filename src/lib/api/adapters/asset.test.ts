import { describe, expect, it } from 'vitest';
import { toAsset } from './asset';

describe('toAsset', () => {
  it('maps the raw asset response body to a domain Asset', () => {
    const apiResponseBody = {
      id: 'asset1',
      catalogId: 'cat1',
      contentType: 'image/png',
      byteSize: 1024,
      publicUrl: 'https://cdn.example.com/asset1.png',
      createdAt: '2026-01-01T00:00:00Z',
    };

    expect(toAsset(apiResponseBody)).toEqual({
      id: 'asset1',
      publicUrl: 'https://cdn.example.com/asset1.png',
    });
  });
});
