'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { ApiError } from '@/lib/api/errors';
import { useLogin } from '../hooks/use-login';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginValues = z.infer<typeof loginSchema>;

function loginErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (!(error instanceof ApiError)) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }
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
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <p id="email-error" className="text-destructive text-sm">
            {errors.email.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Senha</Label>
        <PasswordInput
          id="password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <p id="password-error" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        )}
      </div>
      {loginErrorMessage(login.error) && (
        <p role="alert" className="text-destructive text-sm">
          {loginErrorMessage(login.error)}
        </p>
      )}
      <Button type="submit" disabled={login.isPending} className="w-full">
        Entrar
      </Button>
    </form>
  );
}
