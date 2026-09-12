import {
  toConfirmRow,
  toPreviewRow,
  type ConfirmRow,
  type PreviewRow,
} from '@/lib/api/adapters/csv-import';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

async function uploadCsv(
  catalogId: string,
  step: 'preview' | 'confirm',
  file: Blob,
): Promise<{ rows: unknown[] }> {
  const formData = new FormData();
  formData.append('file', file, 'import.csv');

  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/products/import/${step}`,
    {
      method: 'POST',
      body: formData,
    },
  );
  return response.json();
}

export async function previewCsvImport(
  catalogId: string,
  file: Blob,
): Promise<PreviewRow[]> {
  const body = await uploadCsv(catalogId, 'preview', file);
  return (body.rows as Parameters<typeof toPreviewRow>[0][]).map(toPreviewRow);
}

export async function confirmCsvImport(
  catalogId: string,
  file: Blob,
): Promise<ConfirmRow[]> {
  const body = await uploadCsv(catalogId, 'confirm', file);
  return (body.rows as Parameters<typeof toConfirmRow>[0][]).map(toConfirmRow);
}
