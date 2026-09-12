import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCategory } from '../api/category';

type DeleteCategoryInput = {
  catalogId: string;
  id: string;
};

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, id }: DeleteCategoryInput) =>
      deleteCategory(catalogId, id),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', catalogId] });
    },
  });
}
