import { toCategory, type Category } from '@/lib/api/adapters/category';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function getCategories(catalogId: string): Promise<Category[]> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/categories`,
  );
  const body = await response.json();
  return body.map(toCategory);
}

export async function createCategory(
  catalogId: string,
  payload: { name: string },
): Promise<Category> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/categories`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return toCategory(await response.json());
}

export async function updateCategory(
  catalogId: string,
  id: string,
  payload: { name: string },
): Promise<Category> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/categories/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return toCategory(await response.json());
}

export async function deleteCategory(
  catalogId: string,
  id: string,
): Promise<void> {
  await authenticatedFetch(`/api/v1/catalogs/${catalogId}/categories/${id}`, {
    method: 'DELETE',
  });
}
