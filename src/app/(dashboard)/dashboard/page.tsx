'use client';

import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview';
import { useCatalog } from '@/features/dashboard/hooks/use-catalog';

export default function DashboardPage() {
  const { data: catalog, isLoading, isError } = useCatalog();

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return <p>Não foi possível carregar os dados da loja. Tente novamente.</p>;
  }

  if (!catalog) {
    return <p>Crie sua loja antes de ver o resumo do catálogo.</p>;
  }

  return <DashboardOverview catalog={catalog} />;
}
