import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCategory } from '../api/category';

type UpdateCategoryInput = {
  catalogId: string;
  id: string;
  payload: { name: string };
};

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, id, payload }: UpdateCategoryInput) =>
      updateCategory(catalogId, id, payload),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['categories', catalogId] });
    },
  });
}
