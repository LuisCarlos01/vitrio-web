import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProduct, type UpdateProductPayload } from '../api/product';

type UpdateProductInput = {
  catalogId: string;
  id: string;
  payload: UpdateProductPayload;
};

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, id, payload }: UpdateProductInput) =>
      updateProduct(catalogId, id, payload),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', catalogId] });
    },
  });
}
