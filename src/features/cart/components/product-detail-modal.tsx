'use client';

import { useState } from 'react';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import type { PublicProduct } from '@/lib/api/adapters/public-catalog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        role="dialog"
        aria-label={product.name}
        className="bg-popover fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-y-auto rounded-t-2xl p-4 sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:w-full sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
      >
        <div className="bg-border mx-auto mb-1 h-1 w-9 shrink-0 rounded-full sm:hidden" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Fechar"
          onClick={onClose}
          className="bg-muted absolute top-2 right-2"
        >
          <XIcon />
        </Button>
        {product.imageUrl && (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 pt-3">
          {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
          <h2 className="font-heading text-lg font-semibold">{product.name}</h2>
          {product.description && (
            <p className="text-muted-foreground text-sm">
              {product.description}
            </p>
          )}
        </div>
        <div className="mt-4 flex flex-row items-center justify-between gap-3">
          <QuantityStepper
            quantity={quantity}
            onChange={setQuantity}
            max={product.quantityAvailable}
            disabled={isOutOfStock}
          />
          {isOutOfStock ? (
            <Button type="button" variant="outline" disabled className="flex-1">
              Esgotado
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => onAddToCart(product.id, quantity)}
              className="text-primary-foreground flex-1 bg-[var(--tenant-button)] hover:bg-[var(--tenant-button)]/90"
            >
              Adicionar ao carrinho
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
