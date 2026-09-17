import { CatalogForm } from '@/features/dashboard/components/catalog-form';

export default function StorePage() {
  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Loja</h1>
      <CatalogForm />
    </main>
  );
}
