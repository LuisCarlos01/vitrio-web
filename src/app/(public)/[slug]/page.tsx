import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { StorefrontCatalog } from '@/features/catalog/components/storefront-catalog';
import { getPublicCatalog } from '@/features/catalog/api/public-catalog';
import { ApiError } from '@/lib/api/errors';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getPublicCatalog(slug).catch(() => null);
  if (!catalog) return {};

  return {
    title: catalog.name,
    // Ao compartilhar o link da loja, o preview deve mostrar a logo da
    // revendedora (não a marca Vitrio) — sem logoUrl, omite a imagem em vez
    // de cair num logo genérico que não representa a loja.
    openGraph: {
      title: catalog.name,
      ...(catalog.logoUrl ? { images: [catalog.logoUrl] } : {}),
    },
  };
}

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
