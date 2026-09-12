import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCatalog } from '../api/catalog';

type UpdateCatalogInput = {
  id: string;
  payload: Parameters<typeof updateCatalog>[1];
};

export function useUpdateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateCatalogInput) =>
      updateCatalog(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
