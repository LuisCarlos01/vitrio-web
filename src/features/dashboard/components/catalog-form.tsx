'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCatalog } from '../hooks/use-catalog';
import { useCreateCatalog } from '../hooks/use-create-catalog';
import { useUpdateCatalog } from '../hooks/use-update-catalog';

const catalogFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  primaryColorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .or(z.literal('')),
  buttonColorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida')
    .or(z.literal('')),
  instagramHandle: z.string(),
});

type CatalogFormValues = z.infer<typeof catalogFormSchema>;

const createCatalogSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
});

type CreateCatalogValues = z.infer<typeof createCatalogSchema>;

function CreateCatalogForm() {
  const createCatalog = useCreateCatalog();
  const { register, handleSubmit } = useForm<CreateCatalogValues>({
    resolver: zodResolver(createCatalogSchema),
  });

  return (
    <form onSubmit={handleSubmit((values) => createCatalog.mutate(values))}>
      <div>
        <Label htmlFor="create-name">Nome da sua loja</Label>
        <Input id="create-name" {...register('name')} />
      </div>
      <Button type="submit" disabled={createCatalog.isPending}>
        Criar loja
      </Button>
    </form>
  );
}

export function CatalogForm() {
  const { data: catalog, isLoading } = useCatalog();
  const updateCatalog = useUpdateCatalog();
  const { register, handleSubmit, reset } = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogFormSchema),
  });

  useEffect(() => {
    if (catalog) {
      reset({
        name: catalog.name,
        primaryColorHex: catalog.primaryColorHex ?? '',
        buttonColorHex: catalog.buttonColorHex ?? '',
        instagramHandle: catalog.instagramHandle ?? '',
      });
    }
  }, [catalog, reset]);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!catalog) {
    return <CreateCatalogForm />;
  }

  return (
    <form
      onSubmit={handleSubmit((values) =>
        updateCatalog.mutate({ id: catalog.id, payload: values }),
      )}
    >
      <div>
        <Label>Slug</Label>
        <p>{catalog.slug}</p>
      </div>
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register('name')} />
      </div>
      <div>
        <Label htmlFor="primaryColorHex">Cor primária</Label>
        <Input id="primaryColorHex" {...register('primaryColorHex')} />
      </div>
      <div>
        <Label htmlFor="buttonColorHex">Cor do botão</Label>
        <Input id="buttonColorHex" {...register('buttonColorHex')} />
      </div>
      <div>
        <Label htmlFor="instagramHandle">Instagram</Label>
        <Input id="instagramHandle" {...register('instagramHandle')} />
      </div>
      {updateCatalog.isError && (
        <p>Não foi possível salvar. Tente novamente.</p>
      )}
      <Button type="submit" disabled={updateCatalog.isPending}>
        Salvar
      </Button>
    </form>
  );
}
