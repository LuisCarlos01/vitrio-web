import { useMutation, useQueryClient } from '@tanstack/react-query';
import { verifyWhatsapp } from '../api/whatsapp';

type VerifyWhatsappInput = {
  catalogId: string;
};

export function useVerifyWhatsapp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId }: VerifyWhatsappInput) =>
      verifyWhatsapp(catalogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });
}
