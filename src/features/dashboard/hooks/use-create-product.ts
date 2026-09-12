import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, type CreateProductPayload } from '../api/product';

type CreateProductInput = {
  catalogId: string;
  payload: CreateProductPayload;
};

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, payload }: CreateProductInput) =>
      createProduct(catalogId, payload),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', catalogId] });
    },
  });
}
