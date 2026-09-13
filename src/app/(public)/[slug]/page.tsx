import { notFound } from 'next/navigation';
import { StorefrontCatalog } from '@/features/catalog/components/storefront-catalog';
import { getPublicCatalog } from '@/features/catalog/api/public-catalog';
import { ApiError } from '@/lib/api/errors';

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await fetchCatalogOrNotFound(slug);

  return <StorefrontCatalog slug={slug} catalog={catalog} />;
}

async function fetchCatalogOrNotFound(slug: string) {
  try {
    return await getPublicCatalog(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }
}
