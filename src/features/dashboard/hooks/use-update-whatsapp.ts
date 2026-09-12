import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateWhatsappNumber } from '../api/whatsapp';

type UpdateWhatsappInput = {
  catalogId: string;
  whatsappNumber: string;
};

export function useUpdateWhatsapp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, whatsappNumber }: UpdateWhatsappInput) =>
      updateWhatsappNumber(catalogId, whatsappNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
