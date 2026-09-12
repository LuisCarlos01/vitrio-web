import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProduct } from '../api/product';

type DeleteProductInput = {
  catalogId: string;
  id: string;
};

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, id }: DeleteProductInput) =>
      deleteProduct(catalogId, id),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', catalogId] });
    },
  });
}
