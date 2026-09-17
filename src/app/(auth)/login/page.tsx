import Link from 'next/link';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-lg font-semibold">Entrar</h1>
        <p className="text-muted-foreground text-sm">
          Acesse o painel da sua loja.
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm">
        Ainda não tem conta?{' '}
        <Link href="/register" className="text-primary font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
