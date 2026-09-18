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
import { useRegister } from '../hooks/use-register';

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

type RegisterValues = z.infer<typeof registerSchema>;

function registerErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (!(error instanceof ApiError)) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }
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
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...registerField('email')}
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
          {...registerField('password')}
        />
        {errors.password ? (
          <p id="password-error" className="text-destructive text-sm">
            {errors.password.message}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">
            Mínimo de 8 caracteres
          </p>
        )}
      </div>
      {registerErrorMessage(registerMutation.error) && (
        <p role="alert" className="text-destructive text-sm">
          {registerErrorMessage(registerMutation.error)}
        </p>
      )}
      <Button
        type="submit"
        disabled={registerMutation.isPending}
        className="w-full"
      >
        Criar conta
      </Button>
    </form>
  );
}
