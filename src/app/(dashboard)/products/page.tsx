'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CsvImportForm } from '@/features/dashboard/components/csv-import-form';
import { ProductList } from '@/features/dashboard/components/product-list';
import { useCatalog } from '@/features/dashboard/hooks/use-catalog';

export default function ProductsPage() {
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
    return <p>Crie sua loja antes de cadastrar produtos.</p>;
  }

  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
      <ProductList catalogId={catalog.id} />
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Importar via CSV</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CsvImportForm catalogId={catalog.id} />
        </CardContent>
      </Card>
    </main>
  );
}
