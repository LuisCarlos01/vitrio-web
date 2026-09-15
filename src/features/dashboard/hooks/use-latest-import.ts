import { useQuery } from '@tanstack/react-query';
import { getLatestImport } from '../api/csv-import-log';

export function useLatestImport(catalogId: string) {
  return useQuery({
    queryKey: ['latest-import', catalogId],
    queryFn: () => getLatestImport(catalogId),
  });
}
