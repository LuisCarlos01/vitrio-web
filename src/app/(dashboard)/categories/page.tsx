'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryList } from '@/features/dashboard/components/category-list';
import { useCatalog } from '@/features/dashboard/hooks/use-catalog';

export default function CategoriesPage() {
  const { data: catalog, isLoading } = useCatalog();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!catalog) {
    return <p>Crie sua loja antes de cadastrar categorias.</p>;
  }

  return (
    <main>
      {/* Categorias não tem aba própria na bottom tab bar (4 itens fixos, ADR
          0001/#23) — no mobile, o caminho de volta é esse breadcrumb. */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1 md:hidden"
      >
        <ChevronLeft className="size-4" />
        Produtos
      </Link>
      <h1>Categorias</h1>
      <CategoryList catalogId={catalog.id} />
    </main>
  );
}
