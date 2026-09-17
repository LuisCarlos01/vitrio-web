'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from 'cn';
import { SearchIcon } from 'lucide-react';
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
import { ProductSearchInput } from './product-search-input';
import { StorefrontHeader } from './storefront-header';
import { WhatsappFloatingButton } from './whatsapp-floating-button';

const MAX_BANNER_SLIDES = 4;

export function StorefrontCatalog({
  slug,
  catalog,
}: {
  slug: string;
  catalog: PublicCatalog;
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [detailProduct, setDetailProduct] = useState<PublicProduct | null>(
    null,
  );
  const [bannerInView, setBannerInView] = useState(true);
  const bannerWrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const addItem = useCartStore((state) => state.addItem);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleProducts = catalog.products
    .filter((product) =>
      activeCategoryId ? product.categoryId === activeCategoryId : true,
    )
    .filter((product) =>
      normalizedQuery
        ? product.name.toLowerCase().includes(normalizedQuery)
        : true,
    );

  function handleAddToCart(productId: string, quantity: number) {
    const product = catalog.products.find((item) => item.id === productId);
    if (!product) return;
    addItem(
      slug,
      {
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        quantityAvailable: product.quantityAvailable,
      },
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
  const hasBanner = bannerSlides.length > 0;

  useEffect(() => {
    if (
      !hasBanner ||
      !bannerWrapperRef.current ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setBannerInView(entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(bannerWrapperRef.current);
    return () => observer.disconnect();
  }, [hasBanner]);

  return (
    <div
      className="min-h-screen"
      style={
        {
          '--tenant-primary': catalog.primaryColorHex,
          '--tenant-button': catalog.buttonColorHex,
        } as React.CSSProperties
      }
    >
      <div ref={bannerWrapperRef} className={cn(hasBanner && 'relative')}>
        {hasBanner && <BannerCarousel slides={bannerSlides} />}
        <header
          className={cn(
            'z-30',
            hasBanner
              ? 'absolute inset-x-0 top-0'
              : 'bg-popover border-border sticky top-0 border-b',
          )}
        >
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-4 sm:px-10 sm:py-6">
            <StorefrontHeader
              name={catalog.name}
              logoUrl={catalog.logoUrl}
              instagramHandle={catalog.instagramHandle}
              variant={hasBanner ? 'overlay' : 'default'}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Buscar produto"
                onClick={() => searchInputRef.current?.focus()}
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg',
                  hasBanner
                    ? 'text-primary-foreground drop-shadow'
                    : 'border-border text-foreground border',
                )}
              >
                <SearchIcon className="size-4.5" />
              </button>
              <CartDrawer
                slug={slug}
                whatsappNumber={catalog.whatsappNumber}
                variant={hasBanner ? 'overlay' : 'default'}
                floating={hasBanner && !bannerInView}
              />
            </div>
          </div>
        </header>
      </div>
      {catalog.products.length === 0 ? (
        <p className="text-muted-foreground px-4 py-16 text-center text-sm">
          Esta loja ainda não tem produtos.
        </p>
      ) : (
        <div className="mx-auto flex max-w-6xl flex-col gap-4 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CategoryFilter
              categories={catalog.categories}
              activeCategoryId={activeCategoryId}
              onSelect={setActiveCategoryId}
            />
            <div className="px-4 sm:w-56 sm:shrink-0 sm:px-0">
              <ProductSearchInput
                ref={searchInputRef}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
          {visibleProducts.length === 0 ? (
            <p className="text-muted-foreground px-4 py-12 text-center text-sm">
              Nenhum produto encontrado.
            </p>
          ) : (
            <ProductGrid
              products={visibleProducts}
              categories={catalog.categories}
              onAddToCart={handleAddToCart}
              onOpenDetail={setDetailProduct}
            />
          )}
        </div>
      )}
      <p className="text-muted-foreground px-4 py-6 text-center text-xs">
        Catálogo por Vitrio
      </p>
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
      <div className="fixed right-4 bottom-4 z-40">
        <WhatsappFloatingButton
          whatsappNumber={catalog.whatsappNumber}
          buttonColorHex={catalog.buttonColorHex}
        />
      </div>
    </div>
  );
}
