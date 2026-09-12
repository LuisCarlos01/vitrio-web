import { CatalogForm } from '@/features/dashboard/components/catalog-form';
import { WhatsappForm } from '@/features/dashboard/components/whatsapp-form';

export default function DashboardPage() {
  return (
    <main>
      <h1>Minha loja</h1>
      <CatalogForm />
      <h2>WhatsApp</h2>
      <WhatsappForm />
    </main>
  );
}
