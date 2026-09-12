import { useQuery } from '@tanstack/react-query';
import { getCatalogs } from '../api/catalog';

export function useCatalog() {
  return useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const catalogs = await getCatalogs();
      return catalogs[0] ?? null;
    },
  });
}
