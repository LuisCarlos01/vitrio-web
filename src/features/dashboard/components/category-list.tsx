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
import type { Category } from '@/lib/api/adapters/category';
import { useCategories } from '../hooks/use-categories';
import { useCreateCategory } from '../hooks/use-create-category';
import { useDeleteCategory } from '../hooks/use-delete-category';
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
    >
      <Label htmlFor="new-category-name">Nome da categoria</Label>
      <Input id="new-category-name" {...register('name')} />
      {errors.name && <p role="alert">{errors.name.message}</p>}
      <Button type="submit" disabled={createCategory.isPending}>
        Adicionar
      </Button>
      {createCategory.isError && (
        <p role="alert">Não foi possível criar a categoria.</p>
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
        >
          <Label htmlFor={`edit-name-${category.id}`}>Novo nome</Label>
          <Input id={`edit-name-${category.id}`} {...register('name')} />
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
}: {
  catalogId: string;
  category: Category;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <li>
      <span>{category.name}</span>
      <Button
        aria-label={`Editar ${category.name}`}
        onClick={() => setEditOpen(true)}
      >
        Editar
      </Button>
      <Button
        aria-label={`Excluir ${category.name}`}
        onClick={() => setDeleteOpen(true)}
      >
        Excluir
      </Button>
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
  const { data: categories, isLoading } = useCategories(catalogId);

  if (isLoading) {
    return <p>Carregando...</p>;
  }

  return (
    <div>
      {categories && categories.length > 0 ? (
        <ul>
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              catalogId={catalogId}
              category={category}
            />
          ))}
        </ul>
      ) : (
        <p>Nenhuma categoria cadastrada ainda.</p>
      )}
      <CreateCategoryForm catalogId={catalogId} />
    </div>
  );
}
