'use client';

import { useState } from 'react';
import type { PublicProduct } from '@/lib/api/adapters/public-catalog';
import { QuantityStepper } from './quantity-stepper';

type ProductDetailModalProps = {
  product: PublicProduct | null;
  categoryName: string | null;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
};

export function ProductDetailModal({
  product,
  categoryName,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return null;
  }

  const isOutOfStock = product.quantityAvailable === 0 || !product.isOrderable;

  return (
    <div role="dialog" aria-label={product.name}>
      <button type="button" aria-label="Fechar" onClick={onClose}>
        Fechar
      </button>
      {product.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- protótipo de vitrine, otimização de imagem fica pra depois
        <img src={product.imageUrl} alt={product.name} />
      )}
      {categoryName && <p>{categoryName}</p>}
      <h2>{product.name}</h2>
      {product.description && <p>{product.description}</p>}
      <QuantityStepper
        quantity={quantity}
        onChange={setQuantity}
        max={product.quantityAvailable}
        disabled={isOutOfStock}
      />
      {isOutOfStock ? (
        <button type="button" disabled>
          Esgotado
        </button>
      ) : (
        <button type="button" onClick={() => onAddToCart(product.id, quantity)}>
          Adicionar ao carrinho
        </button>
      )}
    </div>
  );
}
