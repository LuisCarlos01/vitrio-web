import { WhatsappForm } from '@/features/dashboard/components/whatsapp-form';

export default function WhatsappPage() {
  return (
    <main className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">WhatsApp</h1>
      <WhatsappForm />
    </main>
  );
}
