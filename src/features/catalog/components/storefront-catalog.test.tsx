import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import type { PublicCatalog } from '@/lib/api/adapters/public-catalog';
import { useCartStore } from '@/features/cart/store/cart-store';
import { StorefrontCatalog } from './storefront-catalog';

const SLUG = 'loja-da-ana';

function buildCatalog(overrides: Partial<PublicCatalog> = {}): PublicCatalog {
  return {
    name: 'Loja da Ana',
    logoUrl: null,
    primaryColorHex: '#DB2777',
    buttonColorHex: '#7C3AED',
    instagramHandle: 'lojadaana',
    whatsappNumber: '+5511999999999',
    categories: [
      { id: 'cat-1', name: 'Perfumes' },
      { id: 'cat-2', name: 'Maquiagem' },
    ],
    products: [
      {
        id: 'prod-1',
        name: 'Eggeo Blossom',
        sku: 'EGG-01',
        description: null,
        imageUrl: null,
        categoryId: 'cat-1',
        quantityAvailable: 5,
        isOrderable: true,
      },
      {
        id: 'prod-2',
        name: 'Glamour Noir',
        sku: 'GLM-01',
        description: null,
        imageUrl: null,
        categoryId: 'cat-2',
        quantityAvailable: 5,
        isOrderable: true,
      },
    ],
    ...overrides,
  };
}

describe('StorefrontCatalog', () => {
  beforeEach(() => {
    useCartStore.setState({ itemsBySlug: {} });
  });

  it('renders the store header and every product when "Todos" is active', () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    expect(
      screen.getByRole('heading', { name: 'Loja da Ana' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.getByText('Glamour Noir')).toBeInTheDocument();
  });

  it('filters the grid to the selected category', async () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Perfumes' }));

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.queryByText('Glamour Noir')).not.toBeInTheDocument();
  });

  it('shows an empty-catalog message when there are no products', () => {
    render(
      <StorefrontCatalog
        slug={SLUG}
        catalog={buildCatalog({ products: [] })}
      />,
    );

    expect(
      screen.getByText('Esta loja ainda não tem produtos.'),
    ).toBeInTheDocument();
  });

  it("exposes the tenant's colors as CSS custom properties", () => {
    const { container } = render(
      <StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--tenant-primary')).toBe('#DB2777');
    expect(root.style.getPropertyValue('--tenant-button')).toBe('#7C3AED');
  });

  it('adds a product to the cart store, scoped to the store slug, when its card add-to-cart button is used', async () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Adicionar ao carrinho' })[0],
    );

    expect(useCartStore.getState().itemsBySlug[SLUG]).toEqual([
      {
        productId: 'prod-1',
        name: 'Eggeo Blossom',
        imageUrl: null,
        quantity: 1,
      },
    ]);
    expect(useCartStore.getState().itemsBySlug['outra-loja']).toBeUndefined();
  });

  it('opens the product detail modal when a product name is clicked, and adds to cart from it', async () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    await userEvent.click(screen.getByText('Glamour Noir'));

    const dialog = screen.getByRole('dialog', { name: 'Glamour Noir' });
    expect(dialog).toBeInTheDocument();

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Aumentar quantidade' }),
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Adicionar ao carrinho' }),
    );

    expect(useCartStore.getState().itemsBySlug[SLUG]).toEqual([
      {
        productId: 'prod-2',
        name: 'Glamour Noir',
        imageUrl: null,
        quantity: 2,
      },
    ]);
  });

  it('renders the cart drawer trigger wired to the catalog whatsappNumber', () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    expect(
      screen.getByRole('button', { name: /Ver carrinho/ }),
    ).toBeInTheDocument();
  });

  it('does not show items added while browsing a different store', () => {
    useCartStore
      .getState()
      .addItem(
        'outra-loja',
        { productId: 'prod-9', name: 'Produto de outra loja', imageUrl: null },
        3,
      );

    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    expect(
      screen.getByRole('button', { name: /Ver carrinho.*0/ }),
    ).toBeInTheDocument();
  });

  it('renders a banner carousel slide with an image for each product that has one', () => {
    render(
      <StorefrontCatalog
        slug={SLUG}
        catalog={buildCatalog({
          products: [
            {
              id: 'prod-1',
              name: 'Eggeo Blossom',
              sku: null,
              description: null,
              imageUrl: 'https://cdn.example.com/eggeo.png',
              categoryId: null,
              quantityAvailable: 5,
              isOrderable: true,
            },
          ],
        })}
      />,
    );

    const dots = screen.getAllByRole('button', { name: /Ir para o banner/ });
    expect(dots).toHaveLength(1);
  });

  it('renders the WhatsApp floating button when the number is verified', () => {
    render(<StorefrontCatalog slug={SLUG} catalog={buildCatalog()} />);

    expect(
      screen.getByRole('link', { name: /Falar no WhatsApp/ }),
    ).toBeInTheDocument();
  });
});
