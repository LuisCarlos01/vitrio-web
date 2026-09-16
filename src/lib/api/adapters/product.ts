type ProductResponseBody = {
  id: string;
  catalogId: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  quantityAvailable: number;
  isVisible: boolean;
  isOrderable: boolean;
  isActive: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  quantityAvailable: number;
  isVisible: boolean;
  isOrderable: boolean;
  isActive: boolean;
  createdAt: string;
};

export function toProduct(body: ProductResponseBody): Product {
  return {
    id: body.id,
    name: body.name,
    sku: body.sku,
    description: body.description,
    imageUrl: body.imageUrl,
    categoryId: body.categoryId,
    quantityAvailable: body.quantityAvailable,
    isVisible: body.isVisible,
    isOrderable: body.isOrderable,
    isActive: body.isActive,
    createdAt: body.createdAt,
  };
}
