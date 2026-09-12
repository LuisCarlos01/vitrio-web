'use client';

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
      <h1>Categorias</h1>
      <CategoryList catalogId={catalog.id} />
    </main>
  );
}
