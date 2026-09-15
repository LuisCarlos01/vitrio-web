'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UNSET_CATALOG_COLORS } from '@/lib/api/adapters/catalog';
import { contrastRatio, WCAG_AA_UI_RATIO } from '@/lib/color/wcag-contrast';
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
  const uploadAsset = useUploadAsset();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
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
      // só o par sentinela completo conta como "sem cor" — uma cor válida isolada
      // (ex. resposta legada com só uma das duas nula) não pode ser descartada junto.
      const hasUnsetColors =
        catalog.primaryColorHex != null &&
        catalog.buttonColorHex != null &&
        catalog.primaryColorHex.toLowerCase() ===
          UNSET_CATALOG_COLORS.primaryColorHex.toLowerCase() &&
        catalog.buttonColorHex.toLowerCase() ===
          UNSET_CATALOG_COLORS.buttonColorHex.toLowerCase();

      reset({
        name: catalog.name,
        primaryColorHex: hasUnsetColors
          ? CURATED_PALETTES[0].primaryColorHex
          : (catalog.primaryColorHex ?? CURATED_PALETTES[0].primaryColorHex),
        buttonColorHex: hasUnsetColors
          ? CURATED_PALETTES[0].buttonColorHex
          : (catalog.buttonColorHex ?? CURATED_PALETTES[0].buttonColorHex),
        instagramHandle: catalog.instagramHandle ?? '',
      });
      setUploadedLogoUrl(null);
      setLogoFile(null);
    }
  }, [catalog, reset]);

  const displayedLogoUrl = uploadedLogoUrl ?? catalog?.logoUrl ?? null;
  const isSaving = uploadAsset.isPending || updateCatalog.isPending;

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (!catalog) {
    return <CreateCatalogForm />;
  }

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        let logoAssetId: string | undefined;
        if (logoFile) {
          const asset = await uploadAsset.mutateAsync({
            catalogId: catalog.id,
            file: logoFile,
          });
          logoAssetId = asset.id;
          setUploadedLogoUrl(asset.publicUrl);
          setLogoFile(null);
        }
        updateCatalog.mutate({
          id: catalog.id,
          payload: { ...values, ...(logoAssetId ? { logoAssetId } : {}) },
        });
      })}
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
        {displayedLogoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- logo vem de um host externo (S3) por catálogo, mesmo padrão do storefront
          <img src={displayedLogoUrl} alt="Logo atual" />
        )}
        <Label htmlFor="logo">Logo</Label>
        <input
          id="logo"
          type="file"
          accept="image/*"
          onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)}
        />
      </div>
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
        <p>Essa combinação de cores pode ficar difícil de ler.</p>
      )}
      <div>
        <Label htmlFor="instagramHandle">Instagram</Label>
        <Input id="instagramHandle" {...register('instagramHandle')} />
      </div>
      {updateCatalog.isError && (
        <p>Não foi possível salvar. Tente novamente.</p>
      )}
      <Button type="submit" disabled={isSaving}>
        Salvar dados da loja
      </Button>
    </form>
  );
}
