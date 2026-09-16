'use client';

import Link from 'next/link';
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
    return <p>Não foi possível carregar o resumo. Tente novamente.</p>;
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
    <main>
      {me && <h1>Olá, {greetingName(me.email, me.name)}!</h1>}

      <section aria-label="Resumo">
        <article>
          <h2>Produtos ativos</h2>
          <p>{activeProducts.length}</p>
          <p>{productsWithoutPhoto.length} sem foto</p>
        </article>
        <article>
          <h2>Categorias</h2>
          <p>{categories.length}</p>
        </article>
        <article>
          <h2>WhatsApp</h2>
          {catalog.isWhatsappVerified ? (
            <p>
              Verificado
              {whatsappVerifiedDays !== null &&
                ` há ${whatsappVerifiedDays} dias`}
            </p>
          ) : (
            <p>Não verificado</p>
          )}
        </article>
        <article>
          <h2>Última importação</h2>
          {latestImport ? (
            <p>
              {latestImport.acceptedCount} aceitos, {latestImport.rejectedCount}{' '}
              recusados
            </p>
          ) : (
            <p>Nenhuma importação ainda.</p>
          )}
        </article>
      </section>

      <nav aria-label="Ações rápidas">
        <Link href="/products">+ Adicionar produto</Link>
        <Link href="/products">Importar CSV</Link>
        <Link href="/whatsapp">Configurar WhatsApp</Link>
      </nav>

      <table>
        <caption>Produtos recentes</caption>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentProducts.map((product) => {
            const outOfStock =
              product.quantityAvailable === 0 || !product.isOrderable;
            const isHealthy =
              !outOfStock && product.isVisible && product.isActive;
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>
                  {product.categoryId
                    ? (categoryNameById.get(product.categoryId) ?? '—')
                    : '—'}
                </td>
                <td>
                  {isHealthy && <span>Ativo</span>}
                  {outOfStock && <span>Sem estoque</span>}
                  {!product.isVisible && <span>Não visível</span>}
                  {!product.isActive && <span>Inativo</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
