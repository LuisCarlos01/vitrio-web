import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCatalog } from '../api/catalog';

export function useCreateCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
