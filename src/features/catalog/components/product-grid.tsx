'use client';

import { useState } from 'react';
import type {
  PublicCategory,
  PublicProduct,
} from '@/lib/api/adapters/public-catalog';
import { QuantityStepper } from '@/features/cart/components/quantity-stepper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function isOutOfStock(product: PublicProduct): boolean {
  return product.quantityAvailable === 0 || !product.isOrderable;
}

function ProductImage({ product }: { product: PublicProduct }) {
  if (!product.imageUrl) {
    return (
      <svg
        role="img"
        aria-label={product.name}
        data-placeholder="true"
        viewBox="0 0 24 24"
        className="text-muted-foreground aspect-square w-full"
      >
        <rect width="24" height="24" fill="currentColor" opacity="0.1" />
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- protótipo de vitrine, otimização de imagem fica pra depois
    <img
      src={product.imageUrl}
      alt={product.name}
      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  );
}

type ProductCardProps = {
  product: PublicProduct;
  categoryName: string | null;
  onAddToCart: (productId: string, quantity: number) => void;
  onOpenDetail: (product: PublicProduct) => void;
};

function ProductCard({
  product,
  categoryName,
  onAddToCart,
  onOpenDetail,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = isOutOfStock(product);

  return (
    <li className="group border-border bg-card flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
      <div className="relative overflow-hidden">
        <ProductImage product={product} />
        {outOfStock && (
          <Badge
            variant="secondary"
            className="bg-background/90 absolute top-2 left-2"
          >
            Esgotado
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col items-center gap-1.5 p-4 text-center">
        {categoryName && (
          <p className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
            {categoryName}
          </p>
        )}
        <button
          type="button"
          onClick={() => onOpenDetail(product)}
          className="font-heading text-sm font-semibold transition-colors hover:text-[var(--tenant-primary)]"
        >
          {product.name}
        </button>
        {product.sku && (
          <p className="text-muted-foreground text-[11px]">{product.sku}</p>
        )}
        {product.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {product.description}
          </p>
        )}
        <div className="mt-auto flex w-full flex-col items-center gap-2.5 pt-3">
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={product.quantityAvailable}
            disabled={outOfStock}
          />
          {outOfStock ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled
              className="w-full"
            >
              Indisponível
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={() => onAddToCart(product.id, quantity)}
              className="text-primary-foreground w-full bg-[var(--tenant-button)] hover:bg-[var(--tenant-button)]/90"
            >
              Adicionar ao carrinho
            </Button>
          )}
        </div>
      </div>
    </li>
  );
}

type ProductGridProps = {
  products: PublicProduct[];
  categories?: PublicCategory[];
  onAddToCart: (productId: string, quantity: number) => void;
  onOpenDetail: (product: PublicProduct) => void;
};

export function ProductGrid({
  products,
  categories = [],
  onAddToCart,
  onOpenDetail,
}: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          categoryName={
            categories.find((category) => category.id === product.categoryId)
              ?.name ?? null
          }
          onAddToCart={onAddToCart}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </ul>
  );
}
