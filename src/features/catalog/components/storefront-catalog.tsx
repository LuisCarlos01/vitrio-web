'use client';

import { useState } from 'react';
import type {
  PublicCatalog,
  PublicProduct,
} from '@/lib/api/adapters/public-catalog';
import { CartDrawer } from '@/features/cart/components/cart-drawer';
import { ProductDetailModal } from '@/features/cart/components/product-detail-modal';
import { useCartStore } from '@/features/cart/store/cart-store';
import { BannerCarousel } from './banner-carousel';
import { CategoryFilter } from './category-filter';
import { ProductGrid } from './product-grid';
import { StorefrontHeader } from './storefront-header';
import { WhatsappFloatingButton } from './whatsapp-floating-button';

const MAX_BANNER_SLIDES = 4;

export function StorefrontCatalog({ catalog }: { catalog: PublicCatalog }) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<PublicProduct | null>(
    null,
  );
  const addItem = useCartStore((state) => state.addItem);

  const visibleProducts = activeCategoryId
    ? catalog.products.filter(
        (product) => product.categoryId === activeCategoryId,
      )
    : catalog.products;

  function handleAddToCart(productId: string, quantity: number) {
    const product = catalog.products.find((item) => item.id === productId);
    if (!product) return;
    addItem(
      { productId: product.id, name: product.name, imageUrl: product.imageUrl },
      quantity,
    );
  }

  const detailCategoryName =
    catalog.categories.find(
      (category) => category.id === detailProduct?.categoryId,
    )?.name ?? null;

  const bannerSlides = catalog.products
    .filter((product) => product.imageUrl)
    .slice(0, MAX_BANNER_SLIDES)
    .map((product) => ({
      id: product.id,
      imageUrl: product.imageUrl as string,
      title: product.name,
    }));

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
        logoUrl={catalog.logoUrl}
        instagramHandle={catalog.instagramHandle}
      />
      <CartDrawer whatsappNumber={catalog.whatsappNumber} />
      <BannerCarousel slides={bannerSlides} />
      {catalog.products.length === 0 ? (
        <p>Esta loja ainda não tem produtos.</p>
      ) : (
        <>
          <CategoryFilter
            categories={catalog.categories}
            activeCategoryId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
          <ProductGrid
            products={visibleProducts}
            onAddToCart={handleAddToCart}
            onOpenDetail={setDetailProduct}
          />
        </>
      )}
      <ProductDetailModal
        key={detailProduct?.id ?? 'none'}
        product={detailProduct}
        categoryName={detailCategoryName}
        onClose={() => setDetailProduct(null)}
        onAddToCart={(productId, quantity) => {
          handleAddToCart(productId, quantity);
          setDetailProduct(null);
        }}
      />
      <WhatsappFloatingButton
        whatsappNumber={catalog.whatsappNumber}
        buttonColorHex={catalog.buttonColorHex}
      />
    </div>
  );
}
