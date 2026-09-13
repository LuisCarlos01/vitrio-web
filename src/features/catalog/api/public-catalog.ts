import {
  toPublicCatalog,
  type PublicCatalog,
} from '@/lib/api/adapters/public-catalog';
import { API_BASE_URL } from '@/lib/api/config';
import { ApiError } from '@/lib/api/errors';

export async function getPublicCatalog(slug: string): Promise<PublicCatalog> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/public/catalogs/${slug}`,
    { next: { revalidate: 60 } },
  );

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: catalog ${slug}`);
  }

  return toPublicCatalog(await response.json());
}
