import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCategory } from '../api/category';

type CreateCategoryInput = {
  catalogId: string;
  payload: { name: string };
};

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, payload }: CreateCategoryInput) =>
      createCategory(catalogId, payload),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', catalogId] });
    },
  });
}
