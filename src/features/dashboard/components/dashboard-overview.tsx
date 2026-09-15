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
  const { data: me } = useMe();
  const { data: products } = useProducts(catalog.id);
  const { data: categories } = useCategories(catalog.id);
  const { data: latestImport } = useLatestImport(catalog.id);

  const activeProducts = products?.filter((product) => product.isActive) ?? [];
  const productsWithoutPhoto =
    products?.filter((product) => !product.imageAssetId) ?? [];
  const categoryNameById = new Map(
    (categories ?? []).map((category) => [category.id, category.name]),
  );
  const recentProducts = products?.slice(0, 5) ?? [];

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
          <p>{categories?.length ?? 0}</p>
        </article>
        <article>
          <h2>WhatsApp</h2>
          {catalog.isWhatsappVerified ? (
            <p>
              Verificado
              {catalog.whatsappVerifiedAt &&
                ` há ${daysSince(catalog.whatsappVerifiedAt)} dias`}
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
            return (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>
                  {product.categoryId
                    ? (categoryNameById.get(product.categoryId) ?? '—')
                    : '—'}
                </td>
                <td>
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
