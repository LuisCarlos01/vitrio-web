import {
  toCsvImportLog,
  type CsvImportLog,
} from '@/lib/api/adapters/csv-import-log';
import { authenticatedFetch } from '@/lib/api/authenticated-fetch';

export async function getLatestImport(
  catalogId: string,
): Promise<CsvImportLog | null> {
  const response = await authenticatedFetch(
    `/api/v1/catalogs/${catalogId}/imports/latest`,
  );

  if (response.status === 204) {
    return null;
  }

  return toCsvImportLog(await response.json());
}
