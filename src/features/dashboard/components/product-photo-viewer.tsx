'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type ProductPhotoViewerProps = {
  product: { name: string; imageUrl: string | null };
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Dois componentes deliberadamente separados (não o mesmo redimensionado por
// CSS): modal centralizado no desktop, bottom sheet de verdade no mobile —
// ver ADR 0002, seção "Produtos (/products)".
export function ProductPhotoViewer({
  product,
  open,
  onOpenChange,
}: ProductPhotoViewerProps) {
  if (!product.imageUrl) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          data-testid="product-photo-modal"
          aria-label={`Foto de ${product.name}`}
          className="hidden md:grid"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- foto vem de um host externo (S3) por produto, mesmo padrão do storefront */}
          <img src={product.imageUrl} alt={product.name} />
        </DialogContent>
      </Dialog>
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 md:hidden" />
          <DialogPrimitive.Popup
            data-testid="product-photo-sheet"
            aria-label={`Foto de ${product.name}`}
            className="bg-popover fixed inset-x-0 bottom-0 z-50 hidden rounded-t-xl p-4 max-md:block"
          >
            <DialogPrimitive.Close
              data-slot="dialog-close"
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-2 right-2"
                />
              }
            >
              <XIcon />
              <span className="sr-only">Fechar</span>
            </DialogPrimitive.Close>
            {/* eslint-disable-next-line @next/next/no-img-element -- foto vem de um host externo (S3) por produto, mesmo padrão do storefront */}
            <img src={product.imageUrl} alt={product.name} />
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
