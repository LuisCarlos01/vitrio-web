import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../api/product';

export function useProducts(catalogId: string) {
  return useQuery({
    queryKey: ['products', catalogId],
    queryFn: () => getProducts(catalogId),
  });
}
