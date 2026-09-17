'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
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
import type { Category } from '@/lib/api/adapters/category';
import { useCategories } from '../hooks/use-categories';
import { useCreateCategory } from '../hooks/use-create-category';
import { useDeleteCategory } from '../hooks/use-delete-category';
import { useProducts } from '../hooks/use-products';
import { useUpdateCategory } from '../hooks/use-update-category';

const categoryNameSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
});

type CategoryNameValues = z.infer<typeof categoryNameSchema>;

function CreateCategoryForm({ catalogId }: { catalogId: string }) {
  const createCategory = useCreateCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryNameValues>({
    resolver: zodResolver(categoryNameSchema),
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        createCategory.mutate(
          { catalogId, payload: values },
          { onSuccess: () => reset() },
        );
      })}
      className="flex flex-col gap-1.5"
    >
      <Label htmlFor="new-category-name">Nome da categoria</Label>
      <div className="flex gap-2">
        <Input id="new-category-name" {...register('name')} />
        <Button
          type="submit"
          disabled={createCategory.isPending}
          className="w-fit"
        >
          Adicionar
        </Button>
      </div>
      {errors.name && (
        <p role="alert" className="text-destructive text-sm">
          {errors.name.message}
        </p>
      )}
      {createCategory.isError && (
        <p role="alert" className="text-destructive text-sm">
          Não foi possível criar a categoria.
        </p>
      )}
    </form>
  );
}

function EditCategoryDialog({
  catalogId,
  category,
  open,
  onOpenChange,
}: {
  catalogId: string;
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const updateCategory = useUpdateCategory();
  const { register, handleSubmit } = useForm<CategoryNameValues>({
    resolver: zodResolver(categoryNameSchema),
    defaultValues: { name: category.name },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar categoria</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((values) => {
            updateCategory.mutate(
              { catalogId, id: category.id, payload: values },
              { onSuccess: () => onOpenChange(false) },
            );
          })}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`edit-name-${category.id}`}>Novo nome</Label>
            <Input id={`edit-name-${category.id}`} {...register('name')} />
          </div>
          {updateCategory.isError && (
            <p role="alert" className="text-destructive text-sm">
              Não foi possível salvar a categoria.
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={updateCategory.isPending}>
              Salvar edição
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  catalogId,
  category,
  open,
  onOpenChange,
}: {
  catalogId: string;
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteCategory = useDeleteCategory();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir &quot;{category.name}&quot;?</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Os produtos desta categoria não serão excluídos — só ficarão sem
          categoria.
        </p>
        {deleteCategory.isError && (
          <p role="alert" className="text-destructive text-sm">
            Não foi possível excluir a categoria.
          </p>
        )}
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={deleteCategory.isPending}
            onClick={() =>
              deleteCategory.mutate(
                { catalogId, id: category.id },
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

function CategoryRow({
  catalogId,
  category,
  productCount,
}: {
  catalogId: string;
  category: Category;
  productCount: number;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <li className="border-border flex items-center justify-between gap-2 border-b py-2">
      <span className="flex items-center gap-2">
        <span className="text-sm font-medium">{category.name}</span>
        <Badge variant="outline" aria-label={`${productCount} produtos`}>
          {productCount}
        </Badge>
      </span>
      <span className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          aria-label={`Editar ${category.name}`}
          onClick={() => setEditOpen(true)}
        >
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          aria-label={`Excluir ${category.name}`}
          onClick={() => setDeleteOpen(true)}
        >
          Excluir
        </Button>
      </span>
      <EditCategoryDialog
        catalogId={catalogId}
        category={category}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteCategoryDialog
        catalogId={catalogId}
        category={category}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </li>
  );
}

export function CategoryList({ catalogId }: { catalogId: string }) {
  const { data: categories, isLoading, isError } = useCategories(catalogId);
  const { data: products } = useProducts(catalogId);
  const productCountByCategoryId = new Map<string, number>();
  for (const product of products ?? []) {
    if (!product.categoryId) continue;
    productCountByCategoryId.set(
      product.categoryId,
      (productCountByCategoryId.get(product.categoryId) ?? 0) + 1,
    );
  }

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  if (isError) {
    return (
      <p role="alert">
        Não foi possível carregar as categorias. Tente novamente.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {categories && categories.length > 0 ? (
        <ul>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              catalogId={catalogId}
              category={category}
              productCount={productCountByCategoryId.get(category.id) ?? 0}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted-foreground text-sm">
          Nenhuma categoria cadastrada ainda.
        </p>
      )}
      <CreateCategoryForm catalogId={catalogId} />
    </div>
  );
}
