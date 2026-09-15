import { toCatalog, type Catalog } from '@/lib/api/adapters/catalog';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function getCatalogs(): Promise<Catalog[]> {
  const response = await authenticatedFetch('/api/v1/catalogs');
  const body = await response.json();
  return body.map(toCatalog);
}

export async function createCatalog(payload: {
  name: string;
}): Promise<Catalog> {
  const response = await authenticatedFetch('/api/v1/catalogs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return toCatalog(await response.json());
}

type UpdateCatalogPayload = Partial<{
  name: string;
  primaryColorHex: string;
  buttonColorHex: string;
  instagramHandle: string;
  logoAssetId: string;
}>;

export async function updateCatalog(
  id: string,
  payload: UpdateCatalogPayload,
): Promise<Catalog> {
  const response = await authenticatedFetch(`/api/v1/catalogs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return toCatalog(await response.json());
}
