import { toProduct, type Product } from '@/lib/api/adapters/product';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export type CreateProductPayload = {
  name: string;
  sku?: string;
  description?: string;
  imageAssetId: string;
  categoryId?: string;
};

export type UpdateProductPayload = Partial<{
  name: string;
  sku: string;
  description: string;
  imageAssetId: string;
  categoryId: string;
  quantityAvailable: number;
  isVisible: boolean;
  isOrderable: boolean;
  isActive: boolean;
}>;

export async function getProducts(catalogId: string): Promise<Product[]> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/products`,
  );
  const body = await response.json();
  return body.map(toProduct);
}

export async function createProduct(
  catalogId: string,
  payload: CreateProductPayload,
): Promise<Product> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/products`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return toProduct(await response.json());
}

export async function updateProduct(
  catalogId: string,
  id: string,
  payload: UpdateProductPayload,
): Promise<Product> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/products/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
  return toProduct(await response.json());
}

export async function deleteProduct(
  catalogId: string,
  id: string,
): Promise<void> {
  await authenticatedFetch(`/api/v1/catalogs/${catalogId}/products/${id}`, {
    method: 'DELETE',
  });
}
