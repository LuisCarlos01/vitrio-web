'use client';

import { useState } from 'react';
import type { PublicProduct } from '@/lib/api/adapters/public-catalog';
import { QuantityStepper } from '@/features/cart/components/quantity-stepper';

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
      >
        <rect width="24" height="24" fill="currentColor" opacity="0.1" />
      </svg>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- protótipo de vitrine, otimização de imagem fica pra depois
  return <img src={product.imageUrl} alt={product.name} />;
}

type ProductCardProps = {
  product: PublicProduct;
  onAddToCart: (productId: string, quantity: number) => void;
  onOpenDetail: (product: PublicProduct) => void;
};

function ProductCard({ product, onAddToCart, onOpenDetail }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = isOutOfStock(product);

  return (
    <li>
      <ProductImage product={product} />
      {outOfStock && <span>Esgotado</span>}
      <button type="button" onClick={() => onOpenDetail(product)}>
        {product.name}
      </button>
      {product.sku && <p>{product.sku}</p>}
      {product.description && <p>{product.description}</p>}
      <QuantityStepper
        quantity={quantity}
        onChange={setQuantity}
        disabled={outOfStock}
      />
      {outOfStock ? (
        <button type="button" disabled>
          Indisponível
        </button>
      ) : (
        <button type="button" onClick={() => onAddToCart(product.id, quantity)}>
          Adicionar ao carrinho
        </button>
      )}
    </li>
  );
}

type ProductGridProps = {
  products: PublicProduct[];
  onAddToCart: (productId: string, quantity: number) => void;
  onOpenDetail: (product: PublicProduct) => void;
};

export function ProductGrid({
  products,
  onAddToCart,
  onOpenDetail,
}: ProductGridProps) {
  return (
    <ul>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onOpenDetail={onOpenDetail}
        />
      ))}
    </ul>
  );
}
