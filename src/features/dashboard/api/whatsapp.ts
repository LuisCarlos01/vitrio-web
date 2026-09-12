import { toCatalog, type Catalog } from '@/lib/api/adapters/catalog';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function updateWhatsappNumber(
  catalogId: string,
  whatsappNumber: string,
): Promise<Catalog> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/whatsapp`,
    {
      method: 'PUT',
      body: JSON.stringify({ whatsappNumber }),
    },
  );
  return toCatalog(await response.json());
}

export async function verifyWhatsapp(catalogId: string): Promise<Catalog> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/whatsapp/verify`,
    { method: 'POST' },
  );
  return toCatalog(await response.json());
}
