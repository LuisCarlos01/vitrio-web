'use client';

import { CsvImportForm } from '@/features/dashboard/components/csv-import-form';
import { ProductList } from '@/features/dashboard/components/product-list';
import { useCatalog } from '@/features/dashboard/hooks/use-catalog';

export default function ProductsPage() {
  const { data: catalog, isLoading } = useCatalog();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!catalog) {
    return <p>Crie sua loja antes de cadastrar produtos.</p>;
  }

  return (
    <main>
      <h1>Produtos</h1>
      <ProductList catalogId={catalog.id} />
      <h2>Importar via CSV</h2>
      <CsvImportForm catalogId={catalog.id} />
    </main>
  );
}
