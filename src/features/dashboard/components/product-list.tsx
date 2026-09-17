'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiError } from '@/lib/api/errors';
import type { Category } from '@/lib/api/adapters/category';
import type { Product } from '@/lib/api/adapters/product';
import { useCategories } from '../hooks/use-categories';
import { useCreateProduct } from '../hooks/use-create-product';
import { useDeleteAsset } from '../hooks/use-delete-asset';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { useProducts } from '../hooks/use-products';
import { useUpdateProduct } from '../hooks/use-update-product';
import { useUploadAsset } from '../hooks/use-upload-asset';
import { ProductPhotoViewer } from './product-photo-viewer';

const createProductSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
});

type CreateProductValues = z.infer<typeof createProductSchema>;

function createProductErrorMessage(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 409) return 'Esse SKU já está em uso neste catálogo.';
  return 'Não foi possível criar o produto. Tente novamente.';
}

function CreateProductForm({
  catalogId,
  onCreated,
}: {
  catalogId: string;
  onCreated?: () => void;
}) {
  const { data: categories } = useCategories(catalogId);
  const uploadAsset = useUploadAsset();
  const createProduct = useCreateProduct();
  const deleteAsset = useDeleteAsset();
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, reset } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
  });
  const formId = useId();

  const isPending = uploadAsset.isPending || createProduct.isPending;
  const error = createProduct.error;

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        if (!file) return;
        const asset = await uploadAsset.mutateAsync({ catalogId, file });
        createProduct.mutate(
          {
            catalogId,
            payload: {
              name: values.name,
              sku: values.sku || undefined,
              description: values.description || undefined,
              categoryId: values.categoryId || undefined,
              imageAssetId: asset.id,
            },
          },
          {
            onSuccess: () => {
              reset();
              setFile(null);
              onCreated?.();
            },
            // Produto não foi criado, então o asset recém-enviado ficaria órfão no
            // S3/banco (vitrio-web#16) — desfaz o upload. Falha nesse rollback não é
            // mostrada: o erro relevante pro usuário já é o de createProduct.
            onError: () => {
              deleteAsset.mutate({ catalogId, id: asset.id });
            },
          },
        );
      })}
    >
      <Label htmlFor={`${formId}-name`}>Nome</Label>
      <Input id={`${formId}-name`} {...register('name')} />

      <Label htmlFor={`${formId}-sku`}>SKU</Label>
      <Input id={`${formId}-sku`} {...register('sku')} />

      <Label htmlFor={`${formId}-description`}>Descrição</Label>
      <Input id={`${formId}-description`} {...register('description')} />

      {categories && categories.length > 0 && (
        <>
          <Label htmlFor={`${formId}-category`}>Categoria</Label>
          <select id={`${formId}-category`} {...register('categoryId')}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </>
      )}

      <Label htmlFor={`${formId}-image`}>Imagem</Label>
      <input
        id={`${formId}-image`}
        type="file"
        accept="image/*"
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />

      <Button type="submit" disabled={isPending || !file}>
        Adicionar produto
      </Button>
      {error && <p role="alert">{createProductErrorMessage(error)}</p>}
    </form>
  );
}

const editProductSchema = z.object({
  quantityAvailable: z.coerce.number().min(0),
  isVisible: z.boolean(),
  isOrderable: z.boolean(),
  isActive: z.boolean(),
});

type EditProductInput = z.input<typeof editProductSchema>;
type EditProductOutput = z.output<typeof editProductSchema>;

function EditProductDialog({
  catalogId,
  product,
  open,
  onOpenChange,
}: {
  catalogId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateProduct = useUpdateProduct();
  const { register, handleSubmit } = useForm<
    EditProductInput,
    unknown,
    EditProductOutput
  >({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      quantityAvailable: product.quantityAvailable,
      isVisible: product.isVisible,
      isOrderable: product.isOrderable,
      isActive: product.isActive,
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar {product.name}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            updateProduct.mutate(
              { catalogId, id: product.id, payload: values },
              { onSuccess: () => onOpenChange(false) },
            );
          })}
        >
          <Label htmlFor={`quantity-${product.id}`}>
            Quantidade disponível
          </Label>
          <Input
            id={`quantity-${product.id}`}
            type="number"
            {...register('quantityAvailable')}
          />

          <Label htmlFor={`visible-${product.id}`}>Visível</Label>
          <input
            id={`visible-${product.id}`}
            type="checkbox"
            {...register('isVisible')}
          />

          <Label htmlFor={`orderable-${product.id}`}>
            Disponível para compra
          </Label>
          <input
            id={`orderable-${product.id}`}
            type="checkbox"
            {...register('isOrderable')}
          />

          <Label htmlFor={`active-${product.id}`}>Ativo</Label>
          <input
            id={`active-${product.id}`}
            type="checkbox"
            {...register('isActive')}
          />
          {!product.isActive && (
            <p>
              Reativar não restaura visibilidade/disponibilidade automaticamente
              — confirme os dois campos acima se quiser que o produto volte a
              aparecer na vitrine.
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={updateProduct.isPending}>
              Salvar produto
            </Button>
          </DialogFooter>
          {updateProduct.isError && (
            <p role="alert">Não foi possível salvar o produto.</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteProductDialog({
  catalogId,
  product,
  open,
  onOpenChange,
}: {
  catalogId: string;
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProduct = useDeleteProduct();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir &quot;{product.name}&quot;?</DialogTitle>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={deleteProduct.isPending}
            onClick={() =>
              deleteProduct.mutate(
                { catalogId, id: product.id },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Confirmar exclusão
          </Button>
        </DialogFooter>
        {deleteProduct.isError && (
          <p role="alert">Não foi possível excluir o produto.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ProductRow({
  catalogId,
  product,
  categoryName,
}: {
  catalogId: string;
  product: Product;
  categoryName: string | null;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const outOfStock = product.quantityAvailable === 0 || !product.isOrderable;

  return (
    <li className="border-border grid gap-1 border-b py-2 md:grid-cols-[auto_2fr_1fr_1fr_1fr_2fr_auto] md:items-center md:gap-2">
      {product.imageUrl && (
        <button
          type="button"
          aria-label={`Ver foto de ${product.name}`}
          onClick={() => setPhotoOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- foto vem de um host externo (S3) por produto, mesmo padrão do storefront */}
          <img src={product.imageUrl} alt="" className="size-10 object-cover" />
        </button>
      )}
      <span>{product.name}</span>
      <span>{product.sku}</span>
      <span>{categoryName}</span>
      <span>{product.quantityAvailable}</span>
      <span className="flex flex-wrap gap-1">
        <Badge variant={product.isActive ? 'outline' : 'secondary'}>
          {product.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
        <Badge variant={product.isVisible ? 'outline' : 'secondary'}>
          {product.isVisible ? 'Visível' : 'Oculto'}
        </Badge>
        {outOfStock && <Badge variant="destructive">Sem estoque</Badge>}
      </span>
      <span className="flex gap-1">
        <Button
          aria-label={`Editar ${product.name}`}
          onClick={() => setEditOpen(true)}
        >
          Editar
        </Button>
        <Button
          aria-label={`Excluir ${product.name}`}
          onClick={() => setDeleteOpen(true)}
        >
          Excluir
        </Button>
      </span>
      <EditProductDialog
        catalogId={catalogId}
        product={product}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteProductDialog
        catalogId={catalogId}
        product={product}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <ProductPhotoViewer
        product={product}
        open={photoOpen}
        onOpenChange={setPhotoOpen}
      />
    </li>
  );
}

function CreateProductSection({ catalogId }: { catalogId: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="hidden md:block">
        <CreateProductForm catalogId={catalogId} />
      </div>
      <Button
        className="fixed right-4 bottom-20 rounded-full md:hidden"
        aria-label="Novo produto"
        onClick={() => setMobileOpen(true)}
      >
        +
      </Button>
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar produto</DialogTitle>
          </DialogHeader>
          <CreateProductForm
            catalogId={catalogId}
            onCreated={() => setMobileOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ProductList({ catalogId }: { catalogId: string }) {
  const { data: products, isLoading, isError } = useProducts(catalogId);
  const { data: categories } = useCategories(catalogId);
  const categoryNameById = new Map(
    (categories ?? []).map((category: Category) => [
      category.id,
      category.name,
    ]),
  );

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return (
      <p role="alert">
        Não foi possível carregar os produtos. Tente novamente.
      </p>
    );
  }

  return (
    <div>
      {products && products.length > 0 ? (
        <ul>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              catalogId={catalogId}
              product={product}
              categoryName={
                product.categoryId
                  ? (categoryNameById.get(product.categoryId) ?? null)
                  : null
              }
            />
          ))}
        </ul>
      ) : (
        <p>Nenhum produto cadastrado ainda.</p>
      )}
      <CreateProductSection catalogId={catalogId} />
    </div>
  );
}
