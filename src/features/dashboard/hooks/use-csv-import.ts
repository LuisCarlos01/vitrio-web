import { useMutation, useQueryClient } from '@tanstack/react-query';
import { confirmCsvImport, previewCsvImport } from '../api/csv-import';

type CsvImportInput = {
  catalogId: string;
  file: Blob;
};

export function usePreviewCsvImport() {
  return useMutation({
    mutationFn: ({ catalogId, file }: CsvImportInput) =>
      previewCsvImport(catalogId, file),
  });
}

export function useConfirmCsvImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ catalogId, file }: CsvImportInput) =>
      confirmCsvImport(catalogId, file),
    onSuccess: (_data, { catalogId }) => {
      queryClient.invalidateQueries({ queryKey: ['products', catalogId] });
    },
  });
}
