'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileInput } from '@/components/ui/file-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { contrastTextColor } from '@/lib/color/contrast-text-color';
import { contrastRatio, WCAG_AA_UI_RATIO } from '@/lib/color/wcag-contrast';
import { resolveButtonColorHex } from '../lib/catalog-colors';
import { CURATED_PALETTES, ColorPalettePicker } from './color-palette-picker';
import { useCatalog } from '../hooks/use-catalog';
import { useCreateCatalog } from '../hooks/use-create-catalog';
import { useUpdateCatalog } from '../hooks/use-update-catalog';
import { useUploadAsset } from '../hooks/use-upload-asset';

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

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

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
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>
          <h2>Crie sua loja</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((values) => createCatalog.mutate(values))}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-name">Nome da sua loja</Label>
            <Input id="create-name" {...register('name')} />
          </div>
          <Button
            type="submit"
            disabled={createCatalog.isPending}
            className="w-fit"
          >
            Criar loja
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function CatalogForm() {
  const { data: catalog, isLoading, isError } = useCatalog();
  const updateCatalog = useUpdateCatalog();
  const uploadAsset = useUploadAsset();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  // guardado à parte de `logoFile` (que é limpo assim que o upload termina) pra
  // sobreviver a uma falha do PATCH e ser reenviado numa nova tentativa de salvar.
  const [pendingLogoAssetId, setPendingLogoAssetId] = useState<string | null>(
    null,
  );
  const { register, handleSubmit, reset, watch, setValue } =
    useForm<CatalogFormValues>({
      resolver: zodResolver(catalogFormSchema),
    });
  const primaryColorHex = watch('primaryColorHex');
  const buttonColorHex = watch('buttonColorHex');
  const hasLowContrast =
    HEX_COLOR_REGEX.test(primaryColorHex ?? '') &&
    HEX_COLOR_REGEX.test(buttonColorHex ?? '') &&
    contrastRatio(primaryColorHex, buttonColorHex) < WCAG_AA_UI_RATIO;

  useEffect(() => {
    if (catalog) {
      // hasCustomColor vem do backend (spec 010) — reflete se algum PATCH já
      // definiu uma cor de verdade, mesmo que o valor coincida com o placeholder
      // (#6D28D9/#059669), diferente de comparar o hex em si.
      reset({
        name: catalog.name,
        primaryColorHex: catalog.hasCustomColor
          ? (catalog.primaryColorHex ?? CURATED_PALETTES[0].primaryColorHex)
          : CURATED_PALETTES[0].primaryColorHex,
        buttonColorHex: resolveButtonColorHex(catalog),
        instagramHandle: catalog.instagramHandle ?? '',
      });
      setUploadedLogoUrl(null);
      setLogoFile(null);
      setPendingLogoAssetId(null);
    }
  }, [catalog, reset]);

  const displayedLogoUrl = uploadedLogoUrl ?? catalog?.logoUrl ?? null;
  const isSaving = uploadAsset.isPending || updateCatalog.isPending;

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
    return <CreateCatalogForm />;
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let logoAssetId = pendingLogoAssetId ?? undefined;
        if (logoFile) {
          const asset = await uploadAsset.mutateAsync({
            catalogId: catalog.id,
            file: logoFile,
          });
          logoAssetId = asset.id;
          setUploadedLogoUrl(asset.publicUrl);
          setPendingLogoAssetId(asset.id);
          setLogoFile(null);
        }
        updateCatalog.mutate(
          {
            id: catalog.id,
            payload: { ...values, ...(logoAssetId ? { logoAssetId } : {}) },
          },
          { onSuccess: () => setPendingLogoAssetId(null) },
        );
      })}
      className="flex flex-col gap-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Identidade</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Slug</Label>
            <p className="text-muted-foreground text-sm">{catalog.slug}</p>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" {...register('name')} />
          </div>
          <div className="flex flex-col gap-1.5">
            {displayedLogoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- logo vem de um host externo (S3) por catálogo, mesmo padrão do storefront
              <img
                src={displayedLogoUrl}
                alt="Logo atual"
                className="border-border size-16 rounded-md border object-cover"
              />
            )}
            <Label htmlFor="logo">Logo</Label>
            <FileInput
              id="logo"
              accept="image/*"
              buttonLabel="Escolher logo"
              fileName={logoFile?.name}
              onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="instagramHandle">Instagram</Label>
            <Input id="instagramHandle" {...register('instagramHandle')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <h2>Cor da loja</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ColorPalettePicker
            primaryColorHex={primaryColorHex ?? ''}
            buttonColorHex={buttonColorHex ?? ''}
            onChange={(colors) => {
              setValue('primaryColorHex', colors.primaryColorHex, {
                shouldDirty: true,
              });
              setValue('buttonColorHex', colors.buttonColorHex, {
                shouldDirty: true,
              });
            }}
          />
          {hasLowContrast && (
            <p role="alert" className="text-destructive text-sm">
              Essa combinação de cores pode ficar difícil de ler.
            </p>
          )}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Preview do botão da vitrine</p>
            <span
              className="inline-flex w-fit items-center rounded-lg px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: buttonColorHex,
                color: contrastTextColor(buttonColorHex || '#000000'),
              }}
            >
              Falar no WhatsApp
            </span>
          </div>
        </CardContent>
      </Card>

      {uploadAsset.isError && (
        <p role="alert" className="text-destructive text-sm">
          Não foi possível enviar a logo. Tente novamente.
        </p>
      )}
      {updateCatalog.isError && (
        <p role="alert" className="text-destructive text-sm">
          Não foi possível salvar. Tente novamente.
        </p>
      )}
      <Button type="submit" disabled={isSaving} className="w-fit">
        Salvar dados da loja
      </Button>
    </form>
  );
}
