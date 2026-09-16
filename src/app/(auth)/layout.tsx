import { Card } from '@/components/ui/card';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">{children}</Card>
    </main>
  );
}
