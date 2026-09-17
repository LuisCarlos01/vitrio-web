'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
    >
      <section>
        <h2>Identidade</h2>
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
        <div>
          <Label htmlFor="instagramHandle">Instagram</Label>
          <Input id="instagramHandle" {...register('instagramHandle')} />
        </div>
      </section>
      <section>
        <h2>Cor da loja</h2>
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
          <p>Preview do botão da vitrine</p>
          <span
            style={{
              backgroundColor: buttonColorHex,
              color: contrastTextColor(buttonColorHex || '#000000'),
            }}
          >
            Falar no WhatsApp
          </span>
        </div>
      </section>
      {updateCatalog.isError && (
        <p>Não foi possível salvar. Tente novamente.</p>
      )}
      <Button type="submit" disabled={isSaving}>
        Salvar dados da loja
      </Button>
    </form>
  );
}
