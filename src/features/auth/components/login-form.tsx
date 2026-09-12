'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import { useLogin } from '../hooks/use-login';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 401) return 'E-mail ou senha inválidos.';
  if (error.status === 429)
    return 'Muitas tentativas. Aguarde um instante e tente novamente.';
  return 'Não foi possível entrar. Tente novamente.';
}

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const router = useRouter();

  return (
    <form
      onSubmit={handleSubmit((values) =>
        login.mutate(values, {
          onSuccess: () => router.push('/dashboard'),
        }),
      )}
    >
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...register('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" {...register('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      {loginErrorMessage(login.error) && (
        <p role="alert">{loginErrorMessage(login.error)}</p>
      )}
      <Button type="submit" disabled={login.isPending}>
        Entrar
      </Button>
    </form>
  );
}
