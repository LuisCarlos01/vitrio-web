'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { CategoryList } from '@/features/dashboard/components/category-list';
import { useCatalog } from '@/features/dashboard/hooks/use-catalog';

export default function CategoriesPage() {
  const { data: catalog, isLoading, isError } = useCatalog();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return (
      <p role="alert">
        Não foi possível carregar os dados da loja. Tente novamente.
      </p>
    );
  }

  if (!catalog) {
    return <p>Crie sua loja antes de cadastrar categorias.</p>;
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      {/* Categorias não tem aba própria na bottom tab bar (4 itens fixos, ADR
          0001/#23) — no mobile, o caminho de volta é esse breadcrumb. */}
      <Link
        href="/products"
        className="text-muted-foreground inline-flex items-center gap-1 text-sm md:hidden"
      >
        <ChevronLeft className="size-4" />
        Produtos
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Categorias</h1>
      <CategoryList catalogId={catalog.id} />
    </main>
  );
}
