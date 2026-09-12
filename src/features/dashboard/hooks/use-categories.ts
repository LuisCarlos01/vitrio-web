import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/category';

export function useCategories(catalogId: string) {
  return useQuery({
    queryKey: ['categories', catalogId],
    queryFn: () => getCategories(catalogId),
  });
}
