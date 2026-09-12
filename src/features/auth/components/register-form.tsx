'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import { useRegister } from '../hooks/use-register';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

type RegisterValues = z.infer<typeof registerSchema>;

function registerErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 409) return 'Este e-mail já está cadastrado.';
  if (error.status === 429)
    return 'Muitas tentativas. Aguarde um instante e tente novamente.';
  return 'Não foi possível criar a conta. Tente novamente.';
}

export function RegisterForm() {
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });
  const registerMutation = useRegister();
  const router = useRouter();

  return (
    <form
      onSubmit={handleSubmit((values) =>
        registerMutation.mutate(values, {
          onSuccess: () => router.push('/dashboard'),
        }),
      )}
    >
      <div>
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" {...registerField('email')} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" {...registerField('password')} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>
      {registerErrorMessage(registerMutation.error) && (
        <p role="alert">{registerErrorMessage(registerMutation.error)}</p>
      )}
      <Button type="submit" disabled={registerMutation.isPending}>
        Criar conta
      </Button>
    </form>
  );
}
