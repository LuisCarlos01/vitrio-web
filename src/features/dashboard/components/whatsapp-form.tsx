'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WhatsappFloatingButton } from '@/features/catalog/components/whatsapp-floating-button';
import { formatWhatsappNumber } from '@/lib/phone/format-whatsapp-number';
import { resolveButtonColorHex } from '../lib/catalog-colors';
import { useCatalog } from '../hooks/use-catalog';
import { useUpdateWhatsapp } from '../hooks/use-update-whatsapp';
import { useVerifyWhatsapp } from '../hooks/use-verify-whatsapp';

const whatsappFormSchema = z.object({
  whatsappNumber: z.string().min(1, 'Número é obrigatório'),
});

type WhatsappFormValues = z.infer<typeof whatsappFormSchema>;

export function WhatsappForm() {
  const { data: catalog, isLoading, isError } = useCatalog();
  const updateWhatsapp = useUpdateWhatsapp();
  const verifyWhatsapp = useVerifyWhatsapp();
  const { register, handleSubmit, reset } = useForm<WhatsappFormValues>({
    resolver: zodResolver(whatsappFormSchema),
  });
  const { onChange: onNumberChange, ...numberField } =
    register('whatsappNumber');

  useEffect(() => {
    if (catalog) {
      // O backend sempre guarda com o código do país (55) na frente (spec 002,
      // WhatsappNumberNormalizer); a máscara aqui é só DDD + número local, então
      // esse prefixo precisa sair antes de formatar de volta pra exibição.
      reset({
        whatsappNumber: catalog.whatsappNumber
          ? formatWhatsappNumber(catalog.whatsappNumber.replace(/^55/, ''))
          : '',
      });
    }
  }, [catalog, reset]);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return (
      <p role="alert">
        Não foi possível carregar os dados da loja. Tente novamente.
      </p>
    );
  }

  if (!catalog) {
    return <p>Crie sua loja antes de configurar o WhatsApp.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <form
            onSubmit={handleSubmit((values) =>
              updateWhatsapp.mutate({
                catalogId: catalog.id,
                whatsappNumber: values.whatsappNumber,
              }),
            )}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="whatsappNumber">WhatsApp</Label>
              <Input
                id="whatsappNumber"
                inputMode="numeric"
                placeholder="(11) 91234-5678"
                {...numberField}
                onChange={(event) => {
                  event.target.value = formatWhatsappNumber(event.target.value);
                  onNumberChange(event);
                }}
              />
            </div>
            <Badge
              variant={catalog.isWhatsappVerified ? 'outline' : 'secondary'}
              className="w-fit"
            >
              {catalog.isWhatsappVerified ? 'Verificado' : 'Não verificado'}
            </Badge>
            {updateWhatsapp.isError && (
              <p role="alert" className="text-destructive text-sm">
                Não foi possível salvar. Tente novamente.
              </p>
            )}
            <Button
              type="submit"
              disabled={updateWhatsapp.isPending}
              className="w-fit"
            >
              Salvar WhatsApp
            </Button>
          </form>
          {catalog.whatsappNumber && !catalog.isWhatsappVerified && (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={verifyWhatsapp.isPending}
                onClick={() => verifyWhatsapp.mutate({ catalogId: catalog.id })}
                className="w-fit"
              >
                Verificar
              </Button>
              {verifyWhatsapp.isError && (
                <p role="alert" className="text-destructive text-sm">
                  Não foi possível verificar. Tente novamente.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-2">
          <p className="text-sm font-medium">
            Preview do botão pra sua vitrine
          </p>
          <WhatsappFloatingButton
            whatsappNumber={catalog.whatsappNumber}
            buttonColorHex={resolveButtonColorHex(catalog)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
