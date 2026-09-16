'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsappFloatingButton } from '@/features/catalog/components/whatsapp-floating-button';
import { resolveButtonColorHex } from '../lib/catalog-colors';
import { useCatalog } from '../hooks/use-catalog';
import { useUpdateWhatsapp } from '../hooks/use-update-whatsapp';
import { useVerifyWhatsapp } from '../hooks/use-verify-whatsapp';

const whatsappFormSchema = z.object({
  whatsappNumber: z.string().min(1, 'Número é obrigatório'),
});

type WhatsappFormValues = z.infer<typeof whatsappFormSchema>;

export function WhatsappForm() {
  const { data: catalog, isLoading } = useCatalog();
  const updateWhatsapp = useUpdateWhatsapp();
  const verifyWhatsapp = useVerifyWhatsapp();
  const { register, handleSubmit, reset } = useForm<WhatsappFormValues>({
    resolver: zodResolver(whatsappFormSchema),
  });

  useEffect(() => {
    if (catalog) {
      reset({ whatsappNumber: catalog.whatsappNumber ?? '' });
    }
  }, [catalog, reset]);

  if (isLoading || !catalog) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit((values) =>
          updateWhatsapp.mutate({
            catalogId: catalog.id,
            whatsappNumber: values.whatsappNumber,
          }),
        )}
      >
        <div>
          <Label htmlFor="whatsappNumber">WhatsApp</Label>
          <Input id="whatsappNumber" {...register('whatsappNumber')} />
        </div>
        <p>{catalog.isWhatsappVerified ? 'Verificado' : 'Não verificado'}</p>
        {updateWhatsapp.isError && (
          <p>Não foi possível salvar. Tente novamente.</p>
        )}
        <Button type="submit" disabled={updateWhatsapp.isPending}>
          Salvar WhatsApp
        </Button>
      </form>
      {catalog.whatsappNumber && !catalog.isWhatsappVerified && (
        <>
          <Button
            type="button"
            disabled={verifyWhatsapp.isPending}
            onClick={() => verifyWhatsapp.mutate({ catalogId: catalog.id })}
          >
            Verificar
          </Button>
          {verifyWhatsapp.isError && (
            <p>Não foi possível verificar. Tente novamente.</p>
          )}
        </>
      )}
      <div>
        <p>Preview do botão pra sua vitrine</p>
        <WhatsappFloatingButton
          whatsappNumber={catalog.whatsappNumber}
          buttonColorHex={resolveButtonColorHex(catalog)}
        />
      </div>
    </div>
  );
}
