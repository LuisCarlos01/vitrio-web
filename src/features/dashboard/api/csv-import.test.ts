// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { confirmCsvImport, previewCsvImport } from './csv-import';

describe('previewCsvImport', () => {
  it('uploads the CSV and resolves with the preview rows', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products/import/preview`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                errors: [],
              },
            ],
          }),
      ),
    );

    const csv = new Blob(['nome,codigo,descricao,imagem\n'], {
      type: 'text/csv',
    });
    const rows = await previewCsvImport('cat-1', csv);

    expect(rows).toEqual([
      {
        lineNumber: 2,
        name: 'Perfume X',
        sku: 'PRF-001',
        description: null,
        imageUrl: 'https://example.com/x.png',
        errors: [],
        isValid: true,
      },
    ]);
  });
});

describe('confirmCsvImport', () => {
  it('uploads the CSV and resolves with the confirm rows', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products/import/confirm`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                productId: 'p1',
                errors: [],
              },
            ],
          }),
      ),
    );

    const csv = new Blob(['nome,codigo,descricao,imagem\n'], {
      type: 'text/csv',
    });
    const rows = await confirmCsvImport('cat-1', csv);

    expect(rows[0].productId).toBe('p1');
  });

  it('rejects with a rate-limit error when the API returns 429', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/products/import/confirm`,
        () =>
          HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );

    const csv = new Blob(['nome,codigo,descricao,imagem\n'], {
      type: 'text/csv',
    });
    await expect(confirmCsvImport('cat-1', csv)).rejects.toThrow();
  });
});
