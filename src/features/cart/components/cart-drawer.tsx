'use client';

import { useState } from 'react';
import { buildWhatsappCheckoutUrl } from '../lib/build-whatsapp-checkout-url';
import { useCartStore } from '../store/cart-store';
import { QuantityStepper } from './quantity-stepper';

const EMPTY_ITEMS: never[] = [];

export function CartDrawer({
  slug,
  whatsappNumber,
}: {
  slug: string;
  whatsappNumber: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((state) => state.itemsBySlug[slug] ?? EMPTY_ITEMS);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        Ver carrinho ({totalCount})
      </button>
      {isOpen && (
        <div role="dialog" aria-label="Carrinho">
          <button type="button" onClick={() => setIsOpen(false)}>
            Fechar
          </button>
          {items.length === 0 ? (
            <p>Seu carrinho está vazio.</p>
          ) : (
            <>
              <ul>
                {items.map((item) => (
                  <li key={item.productId}>
                    <span>{item.name}</span>
                    <QuantityStepper
                      quantity={item.quantity}
                      onChange={(quantity) =>
                        setQuantity(slug, item.productId, quantity)
                      }
                      max={item.quantityAvailable}
                    />
                    <button
                      type="button"
                      aria-label={`Remover ${item.name}`}
                      onClick={() => removeItem(slug, item.productId)}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
              {whatsappNumber ? (
                <a
                  href={buildWhatsappCheckoutUrl(whatsappNumber, items)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Finalizar no WhatsApp
                </a>
              ) : (
                <p>
                  Esta loja ainda não confirmou o WhatsApp — assim que
                  confirmar, você poderá finalizar por lá. Seu carrinho continua
                  salvo.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
