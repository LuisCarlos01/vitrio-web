import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { PublicCatalog } from '@/lib/api/adapters/public-catalog';
import { StorefrontCatalog } from './storefront-catalog';

function buildCatalog(overrides: Partial<PublicCatalog> = {}): PublicCatalog {
  return {
    name: 'Loja da Ana',
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
  it('renders the store header and every product when "Todos" is active', () => {
    render(<StorefrontCatalog catalog={buildCatalog()} />);

    expect(
      screen.getByRole('heading', { name: 'Loja da Ana' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.getByText('Glamour Noir')).toBeInTheDocument();
  });

  it('filters the grid to the selected category', async () => {
    render(<StorefrontCatalog catalog={buildCatalog()} />);

    await userEvent.click(screen.getByRole('button', { name: 'Perfumes' }));

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.queryByText('Glamour Noir')).not.toBeInTheDocument();
  });

  it('shows an empty-catalog message when there are no products', () => {
    render(<StorefrontCatalog catalog={buildCatalog({ products: [] })} />);

    expect(
      screen.getByText('Esta loja ainda não tem produtos.'),
    ).toBeInTheDocument();
  });

  it("exposes the tenant's colors as CSS custom properties", () => {
    const { container } = render(
      <StorefrontCatalog catalog={buildCatalog()} />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--tenant-primary')).toBe('#DB2777');
    expect(root.style.getPropertyValue('--tenant-button')).toBe('#7C3AED');
  });
});
