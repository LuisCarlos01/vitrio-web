// @vitest-environment node
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { deleteAsset, uploadAsset } from './asset';

describe('uploadAsset', () => {
  it('uploads the file as multipart form-data and resolves with the asset', async () => {
    let receivedFileName: string | null = null;
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/cat-1/assets`,
        async ({ request }) => {
          const formData = await request.formData();
          const file = formData.get('file') as File;
          receivedFileName = file.name;
          return HttpResponse.json(
            {
              id: 'asset1',
              catalogId: 'cat-1',
              contentType: 'image/png',
              byteSize: 4,
              publicUrl: 'https://cdn.example.com/asset1.png',
              createdAt: '2026-01-01T00:00:00Z',
            },
            { status: 201 },
          );
        },
      ),
    );

    const file = new File(['fake'], 'perfume.png', { type: 'image/png' });
    const asset = await uploadAsset('cat-1', file);

    expect(receivedFileName).toBe('perfume.png');
    expect(asset).toEqual({
      id: 'asset1',
      publicUrl: 'https://cdn.example.com/asset1.png',
    });
  });
});

describe('deleteAsset', () => {
  it('sends a DELETE to the catalog-scoped asset endpoint', async () => {
    let received: { catalogId: string; id: string } | null = null;
    server.use(
      http.delete(
        `${API_BASE_URL}/api/v1/catalogs/:catalogId/assets/:id`,
        ({ params }) => {
          received = {
            catalogId: params.catalogId as string,
            id: params.id as string,
          };
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    await deleteAsset('cat-1', 'asset1');

    expect(received).toEqual({ catalogId: 'cat-1', id: 'asset1' });
  });
});
