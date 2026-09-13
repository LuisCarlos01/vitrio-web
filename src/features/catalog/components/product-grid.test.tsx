import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PublicProduct } from '@/lib/api/adapters/public-catalog';
import { ProductGrid } from './product-grid';

function buildProduct(overrides: Partial<PublicProduct> = {}): PublicProduct {
  return {
    id: 'prod-1',
    name: 'Eggeo Blossom',
    sku: 'EGG-01',
    description: 'Floral suave',
    imageUrl: 'https://cdn.example.com/eggeo.png',
    categoryId: 'cat-1',
    quantityAvailable: 5,
    isOrderable: true,
    ...overrides,
  };
}

function renderGrid(
  products: PublicProduct[],
  overrides: {
    onAddToCart?: (productId: string, quantity: number) => void;
    onOpenDetail?: (product: PublicProduct) => void;
  } = {},
) {
  return render(
    <ProductGrid
      products={products}
      onAddToCart={overrides.onAddToCart ?? vi.fn()}
      onOpenDetail={overrides.onOpenDetail ?? vi.fn()}
    />,
  );
}

describe('ProductGrid', () => {
  it('renders the product name and sku', () => {
    renderGrid([buildProduct()]);

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.getByText('EGG-01')).toBeInTheDocument();
  });

  it('does not render a price in any form', () => {
    renderGrid([buildProduct()]);

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });

  it('shows an "Esgotado" badge when the product is not orderable', () => {
    renderGrid([buildProduct({ isOrderable: false })]);

    expect(screen.getByText('Esgotado')).toBeInTheDocument();
  });

  it('shows an "Esgotado" badge when quantityAvailable is 0, even if isOrderable is true', () => {
    renderGrid([buildProduct({ quantityAvailable: 0, isOrderable: true })]);

    expect(screen.getByText('Esgotado')).toBeInTheDocument();
  });

  it('does not show the badge for an in-stock orderable product', () => {
    renderGrid([buildProduct()]);

    expect(screen.queryByText('Esgotado')).not.toBeInTheDocument();
  });

  it('renders a placeholder image when imageUrl is null', () => {
    renderGrid([buildProduct({ imageUrl: null })]);

    expect(screen.getByRole('img', { name: 'Eggeo Blossom' })).toHaveAttribute(
      'data-placeholder',
      'true',
    );
  });

  it('renders the real product photo when imageUrl is present', () => {
    renderGrid([buildProduct()]);

    expect(screen.getByRole('img', { name: 'Eggeo Blossom' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/eggeo.png',
    );
  });

  it('starts each card quantity stepper at 1 and adds to cart with the chosen quantity', async () => {
    const onAddToCart = vi.fn();
    renderGrid([buildProduct()], { onAddToCart });

    expect(screen.getByText('1')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }),
    );

    expect(onAddToCart).toHaveBeenCalledWith('prod-1', 2);
  });

  it('disables the stepper and shows "Esgotado" instead of the add-to-cart button when out of stock', () => {
    renderGrid([buildProduct({ isOrderable: false })]);

    expect(
      screen.queryByRole('button', { name: 'Adicionar ao carrinho' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    ).toBeDisabled();
  });

  it('calls onOpenDetail with the product when its name is clicked', async () => {
    const onOpenDetail = vi.fn();
    const product = buildProduct();
    renderGrid([product], { onOpenDetail });

    await userEvent.click(screen.getByText('Eggeo Blossom'));

    expect(onOpenDetail).toHaveBeenCalledWith(product);
  });
});
