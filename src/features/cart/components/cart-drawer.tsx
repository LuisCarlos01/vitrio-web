'use client';

import { useState } from 'react';
import { ShoppingBagIcon, Trash2Icon, XIcon } from 'lucide-react';
import Image from 'next/image';
import { cn } from 'cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { buildWhatsappCheckoutUrl } from '../lib/build-whatsapp-checkout-url';
import { useCartStore } from '../store/cart-store';
import { QuantityStepper } from './quantity-stepper';

const EMPTY_ITEMS: never[] = [];

export function CartDrawer({
  slug,
  storeName,
  whatsappNumber,
  variant = 'default',
  floating = false,
}: {
  slug: string;
  storeName: string;
  whatsappNumber: string | null;
  variant?: 'default' | 'overlay';
  floating?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.itemsBySlug[slug] ?? EMPTY_ITEMS);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Ver carrinho (${totalCount})`}
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-lg',
          variant === 'overlay'
            ? 'text-primary-foreground drop-shadow'
            : 'border-border text-foreground border',
        )}
      >
        <ShoppingBagIcon className="size-4.5" />
        {totalCount > 0 && (
          <Badge className="text-primary-foreground absolute -top-1.5 -right-1.5 min-w-4 justify-center border-transparent bg-[var(--tenant-button)] px-1 text-[10px]">
            {totalCount}
          </Badge>
        )}
      </button>
      {floating && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={`Ver carrinho (${totalCount})`}
          className="bg-background text-foreground fixed bottom-4 left-4 z-40 flex size-13 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <ShoppingBagIcon className="size-5.5" />
          {totalCount > 0 && (
            <Badge className="text-primary-foreground absolute -top-1 -right-1 min-w-4.5 justify-center border-transparent bg-[var(--tenant-button)] px-1 text-[10px]">
              {totalCount}
            </Badge>
          )}
        </button>
      )}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Carrinho"
            className="bg-popover fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-2xl p-4 sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:bottom-auto sm:h-full sm:max-h-none sm:w-full sm:max-w-sm sm:rounded-none sm:rounded-l-2xl"
          >
            <div className="bg-border mx-auto mb-1 h-1 w-9 shrink-0 rounded-full sm:hidden" />
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBagIcon className="size-4" />
                <h2 className="font-heading text-base font-semibold">
                  Seu carrinho
                </h2>
                <Badge className="text-primary-foreground border-transparent bg-[var(--tenant-button)]">
                  {totalCount}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Fechar"
                onClick={() => setIsOpen(false)}
                className="bg-muted"
              >
                <XIcon />
              </Button>
            </div>
            <p className="text-muted-foreground pb-3 text-xs">
              Sem preço aqui — o valor é combinado direto no WhatsApp.
            </p>
            {items.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                Seu carrinho está vazio.
              </p>
            ) : (
              <>
                <ul className="flex-1 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <li
                      key={item.productId}
                      className="border-border flex items-center gap-3 border-b pb-3"
                    >
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt=""
                          width={56}
                          height={56}
                          className="border-border size-14 shrink-0 rounded-lg border object-cover"
                        />
                      ) : (
                        <div className="bg-muted size-14 shrink-0 rounded-lg" />
                      )}
                      <div className="flex flex-1 flex-col gap-1.5">
                        <span className="text-sm font-medium">{item.name}</span>
                        <QuantityStepper
                          quantity={item.quantity}
                          onChange={(quantity) =>
                            setQuantity(slug, item.productId, quantity)
                          }
                          max={item.quantityAvailable}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remover ${item.name}`}
                        onClick={() => removeItem(slug, item.productId)}
                      >
                        <Trash2Icon />
                      </Button>
                    </li>
                  ))}
                </ul>
                {whatsappNumber ? (
                  <a
                    href={buildWhatsappCheckoutUrl(
                      whatsappNumber,
                      storeName,
                      items,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-foreground mt-3 flex items-center justify-center rounded-lg bg-[var(--tenant-button)] px-4 py-2.5 text-sm font-medium"
                  >
                    Finalizar no WhatsApp
                  </a>
                ) : (
                  <p className="text-muted-foreground border-border mt-3 rounded-lg border border-dashed p-3 text-xs">
                    Esta loja ainda não confirmou o WhatsApp — assim que
                    confirmar, você poderá finalizar por lá. Seu carrinho
                    continua salvo.
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
