'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import type { Product } from '@/lib/api/adapters/product';
import { useCategories } from '../hooks/use-categories';
import { useCreateProduct } from '../hooks/use-create-product';
import { useDeleteProduct } from '../hooks/use-delete-product';
import { useProducts } from '../hooks/use-products';
import { useUpdateProduct } from '../hooks/use-update-product';
import { useUploadAsset } from '../hooks/use-upload-asset';

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

function CreateProductForm({ catalogId }: { catalogId: string }) {
  const { data: categories } = useCategories(catalogId);
  const uploadAsset = useUploadAsset();
  const createProduct = useCreateProduct();
  const [file, setFile] = useState<File | null>(null);
  const { register, handleSubmit, reset } = useForm<CreateProductValues>({
    resolver: zodResolver(createProductSchema),
  });

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
            },
          },
        );
      })}
    >
      <Label htmlFor="new-product-name">Nome</Label>
      <Input id="new-product-name" {...register('name')} />

      <Label htmlFor="new-product-sku">SKU</Label>
      <Input id="new-product-sku" {...register('sku')} />

      <Label htmlFor="new-product-description">Descrição</Label>
      <Input id="new-product-description" {...register('description')} />

      {categories && categories.length > 0 && (
        <>
          <Label htmlFor="new-product-category">Categoria</Label>
          <select id="new-product-category" {...register('categoryId')}>
            <option value="">Sem categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </>
      )}

      <Label htmlFor="new-product-image">Imagem</Label>
      <input
        id="new-product-image"
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
      </DialogContent>
    </Dialog>
  );
}

function ProductRow({
  catalogId,
  product,
}: {
  catalogId: string;
  product: Product;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const outOfStock = product.quantityAvailable === 0 || !product.isOrderable;

  return (
    <li>
      <span>{product.name}</span>
      {outOfStock && <span>Sem estoque</span>}
      {!product.isVisible && <span>Não visível</span>}
      {!product.isActive && <span>Inativo</span>}
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
    </li>
  );
}

export function ProductList({ catalogId }: { catalogId: string }) {
  const { data: products, isLoading } = useProducts(catalogId);

  if (isLoading) {
    return <p>Carregando...</p>;
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
            />
          ))}
        </ul>
      ) : (
        <p>Nenhum produto cadastrado ainda.</p>
      )}
      <CreateProductForm catalogId={catalogId} />
    </div>
  );
}
