import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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

describe('ProductGrid', () => {
  it('renders the product name and sku', () => {
    render(<ProductGrid products={[buildProduct()]} />);

    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
    expect(screen.getByText('EGG-01')).toBeInTheDocument();
  });

  it('does not render a price in any form', () => {
    render(<ProductGrid products={[buildProduct()]} />);

    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });

  it('shows an "Esgotado" badge when the product is not orderable', () => {
    render(<ProductGrid products={[buildProduct({ isOrderable: false })]} />);

    expect(screen.getByText('Esgotado')).toBeInTheDocument();
  });

  it('shows an "Esgotado" badge when quantityAvailable is 0, even if isOrderable is true', () => {
    render(
      <ProductGrid
        products={[buildProduct({ quantityAvailable: 0, isOrderable: true })]}
      />,
    );

    expect(screen.getByText('Esgotado')).toBeInTheDocument();
  });

  it('does not show the badge for an in-stock orderable product', () => {
    render(<ProductGrid products={[buildProduct()]} />);

    expect(screen.queryByText('Esgotado')).not.toBeInTheDocument();
  });

  it('renders a placeholder image when imageUrl is null', () => {
    render(<ProductGrid products={[buildProduct({ imageUrl: null })]} />);

    expect(screen.getByRole('img', { name: 'Eggeo Blossom' })).toHaveAttribute(
      'data-placeholder',
      'true',
    );
  });

  it('renders the real product photo when imageUrl is present', () => {
    render(<ProductGrid products={[buildProduct()]} />);

    expect(screen.getByRole('img', { name: 'Eggeo Blossom' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/eggeo.png',
    );
  });
});
