type PublicCategoryResponseBody = {
  id: string;
  name: string;
};

type PublicProductResponseBody = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  quantityAvailable: number;
  isOrderable: boolean;
};

type PublicCatalogResponseBody = {
  name: string;
  primaryColorHex: string;
  buttonColorHex: string;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  categories: PublicCategoryResponseBody[];
  products: PublicProductResponseBody[];
};

export type PublicCategory = {
  id: string;
  name: string;
};

export type PublicProduct = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  quantityAvailable: number;
  isOrderable: boolean;
};

export type PublicCatalog = {
  name: string;
  primaryColorHex: string;
  buttonColorHex: string;
  instagramHandle: string | null;
  whatsappNumber: string | null;
  categories: PublicCategory[];
  products: PublicProduct[];
};

function toPublicCategory(body: PublicCategoryResponseBody): PublicCategory {
  return {
    id: body.id,
    name: body.name,
  };
}

function toPublicProduct(body: PublicProductResponseBody): PublicProduct {
  return {
    id: body.id,
    name: body.name,
    sku: body.sku,
    description: body.description,
    imageUrl: body.imageUrl,
    categoryId: body.categoryId,
    quantityAvailable: body.quantityAvailable,
    isOrderable: body.isOrderable,
  };
}

export function toPublicCatalog(
  body: PublicCatalogResponseBody,
): PublicCatalog {
  return {
    name: body.name,
    primaryColorHex: body.primaryColorHex,
    buttonColorHex: body.buttonColorHex,
    instagramHandle: body.instagramHandle,
    whatsappNumber: body.whatsappNumber,
    categories: body.categories.map(toPublicCategory),
    products: body.products.map(toPublicProduct),
  };
}
