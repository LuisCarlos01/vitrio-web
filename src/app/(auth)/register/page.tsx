import Link from 'next/link';
import { RegisterForm } from '@/features/auth/components/register-form';

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-semibold">Criar conta</h1>
        <p className="text-muted-foreground text-sm">
          Comece a vender em minutos.
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm">
        Já tem conta?{' '}
        <Link href="/login" className="text-primary font-medium">
          Entrar
        </Link>
      </p>
    </div>
  );
}
