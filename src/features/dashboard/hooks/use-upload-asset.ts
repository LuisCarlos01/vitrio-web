import { useMutation } from '@tanstack/react-query';
import { uploadAsset } from '../api/asset';

type UploadAssetInput = {
  catalogId: string;
  file: File;
};

export function useUploadAsset() {
  return useMutation({
    mutationFn: ({ catalogId, file }: UploadAssetInput) =>
      uploadAsset(catalogId, file),
  });
}
