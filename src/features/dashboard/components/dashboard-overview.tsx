'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Catalog } from '@/lib/api/adapters/catalog';
import { daysSince } from '@/lib/date/days-since';
import { useCategories } from '../hooks/use-categories';
import { useLatestImport } from '../hooks/use-latest-import';
import { useMe } from '../hooks/use-me';
import { useProducts } from '../hooks/use-products';

function greetingName(email: string, name: string | null): string {
  return name ?? email.split('@')[0];
}

export function DashboardOverview({ catalog }: { catalog: Catalog }) {
  const meQuery = useMe();
  const productsQuery = useProducts(catalog.id);
  const categoriesQuery = useCategories(catalog.id);
  const latestImportQuery = useLatestImport(catalog.id);

  const isLoading =
    meQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading ||
    latestImportQuery.isLoading;
  const isError =
    meQuery.isError ||
    productsQuery.isError ||
    categoriesQuery.isError ||
    latestImportQuery.isError;

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return (
      <p role="alert">Não foi possível carregar o resumo. Tente novamente.</p>
    );
  }

  const me = meQuery.data;
  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const latestImport = latestImportQuery.data ?? null;

  const activeProducts = products.filter((product) => product.isActive);
  const productsWithoutPhoto = products.filter((product) => !product.imageUrl);
  const categoryNameById = new Map(
    categories.map((category) => [category.id, category.name]),
  );
  const recentProducts = [...products]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);
  const whatsappVerifiedDays =
    catalog.isWhatsappVerified && catalog.whatsappVerifiedAt
      ? daysSince(catalog.whatsappVerifiedAt)
      : null;

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 p-4 md:p-6">
      {me && (
        <h1 className="text-2xl font-semibold tracking-tight">
          Olá, {greetingName(me.email, me.name)}!
        </h1>
      )}

      <section
        aria-label="Resumo"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <Card>
          <CardHeader>
            <CardTitle>Produtos ativos</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <p className="text-2xl font-semibold">{activeProducts.length}</p>
            <p className="text-muted-foreground text-sm">
              {productsWithoutPhoto.length} sem foto
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
          </CardHeader>
          <CardContent>
            {catalog.isWhatsappVerified ? (
              <p className="text-sm">
                Verificado
                {whatsappVerifiedDays !== null &&
                  ` há ${whatsappVerifiedDays} dias`}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">Não verificado</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Última importação</CardTitle>
          </CardHeader>
          <CardContent>
            {latestImport ? (
              <p className="text-sm">
                {latestImport.acceptedCount} aceitos,{' '}
                {latestImport.rejectedCount} recusados
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma importação ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <nav aria-label="Ações rápidas" className="flex flex-wrap gap-2">
        <Link
          href="/products"
          className={buttonVariants({ variant: 'outline' })}
        >
          + Adicionar produto
        </Link>
        <Link
          href="/products"
          className={buttonVariants({ variant: 'outline' })}
        >
          Importar CSV
        </Link>
        <Link
          href="/whatsapp"
          className={buttonVariants({ variant: 'outline' })}
        >
          Configurar WhatsApp
        </Link>
      </nav>

      <Card>
        <CardContent>
          <table className="w-full text-left text-sm">
            <caption className="mb-2 text-left font-medium">
              Produtos recentes
            </caption>
            <thead>
              <tr className="border-border text-muted-foreground border-b">
                <th className="py-2 font-medium">Nome</th>
                <th className="py-2 font-medium">Categoria</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => {
                const outOfStock =
                  product.quantityAvailable === 0 || !product.isOrderable;
                const isHealthy =
                  !outOfStock && product.isVisible && product.isActive;
                return (
                  <tr key={product.id} className="border-border border-b">
                    <td className="py-2">{product.name}</td>
                    <td className="py-2">
                      {product.categoryId
                        ? (categoryNameById.get(product.categoryId) ?? '—')
                        : '—'}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {isHealthy && <Badge variant="outline">Ativo</Badge>}
                        {outOfStock && (
                          <Badge variant="destructive">Sem estoque</Badge>
                        )}
                        {!product.isVisible && (
                          <Badge variant="secondary">Não visível</Badge>
                        )}
                        {!product.isActive && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
