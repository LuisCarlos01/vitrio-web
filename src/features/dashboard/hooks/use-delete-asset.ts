import { useMutation } from '@tanstack/react-query';
import { deleteAsset } from '../api/asset';

type DeleteAssetInput = {
  catalogId: string;
  id: string;
};

export function useDeleteAsset() {
  return useMutation({
    mutationFn: ({ catalogId, id }: DeleteAssetInput) =>
      deleteAsset(catalogId, id),
  });
}
