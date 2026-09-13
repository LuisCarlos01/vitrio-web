'use client';

import { useState } from 'react';
import type { PublicCatalog } from '@/lib/api/adapters/public-catalog';
import { CategoryFilter } from './category-filter';
import { ProductGrid } from './product-grid';
import { StorefrontHeader } from './storefront-header';

export function StorefrontCatalog({ catalog }: { catalog: PublicCatalog }) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const visibleProducts = activeCategoryId
    ? catalog.products.filter(
        (product) => product.categoryId === activeCategoryId,
      )
    : catalog.products;

  return (
    <div
      style={
        {
          '--tenant-primary': catalog.primaryColorHex,
          '--tenant-button': catalog.buttonColorHex,
        } as React.CSSProperties
      }
    >
      <StorefrontHeader
        name={catalog.name}
        instagramHandle={catalog.instagramHandle}
      />
      {catalog.products.length === 0 ? (
        <p>Esta loja ainda não tem produtos.</p>
      ) : (
        <>
          <CategoryFilter
            categories={catalog.categories}
            activeCategoryId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
          <ProductGrid products={visibleProducts} />
        </>
      )}
    </div>
  );
}
