import { toAsset, type Asset } from '@/lib/api/adapters/asset';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function uploadAsset(
  catalogId: string,
  file: File,
): Promise<Asset> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/assets`,
    {
      method: 'POST',
      body: formData,
    },
  );
  return toAsset(await response.json());
}

export async function deleteAsset(
  catalogId: string,
  id: string,
): Promise<void> {
  await authenticatedFetch(`/api/v1/catalogs/${catalogId}/assets/${id}`, {
    method: 'DELETE',
  });
}
