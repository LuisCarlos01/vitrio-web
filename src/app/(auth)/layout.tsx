import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex justify-center">
        <Image
          src="/brand/logo-preta.png"
          alt="Vitrio"
          width={200}
          height={200}
          className="h-12 w-auto dark:hidden"
          priority
        />
        <Image
          src="/brand/logo-branca.png"
          alt="Vitrio"
          width={200}
          height={200}
          className="hidden h-12 w-auto dark:block"
          priority
        />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
