import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PublicProduct } from '@/lib/api/adapters/public-catalog';
import { ProductDetailModal } from './product-detail-modal';

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

describe('ProductDetailModal', () => {
  it('renders nothing when product is null', () => {
    render(
      <ProductDetailModal
        product={null}
        categoryName={null}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the product photo, category, and description', () => {
    render(
      <ProductDetailModal
        product={buildProduct()}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );

    expect(screen.getByRole('img', { name: 'Eggeo Blossom' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/eggeo.png',
    );
    expect(screen.getByText('Perfumes')).toBeInTheDocument();
    expect(screen.getByText('Floral suave')).toBeInTheDocument();
  });

  it('calls onAddToCart with the product id and chosen quantity', async () => {
    const onAddToCart = vi.fn();
    render(
      <ProductDetailModal
        product={buildProduct()}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={onAddToCart}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar ao carrinho' }),
    );

    expect(onAddToCart).toHaveBeenCalledWith('prod-1', 2);
  });

  it('never lets the stepper go past the available stock', async () => {
    render(
      <ProductDetailModal
        product={buildProduct({ quantityAvailable: 2 })}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );
    const increment = screen.getByRole('button', {
      name: 'Aumentar quantidade',
    });

    await userEvent.click(increment);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(increment).toBeDisabled();
  });

  it('shows a disabled "Esgotado" button instead of "Adicionar ao carrinho" when out of stock', () => {
    render(
      <ProductDetailModal
        product={buildProduct({ isOrderable: false })}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Adicionar ao carrinho' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Esgotado' })).toBeDisabled();
  });

  it('resets the quantity to 1 when a different product opens while mounted', async () => {
    const { rerender } = render(
      <ProductDetailModal
        key="prod-1"
        product={buildProduct()}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    );
    expect(screen.getByText('2')).toBeInTheDocument();

    rerender(
      <ProductDetailModal
        key="prod-2"
        product={buildProduct({ id: 'prod-2', name: 'Glamour Noir' })}
        categoryName="Perfumes"
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />,
    );

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    render(
      <ProductDetailModal
        product={buildProduct()}
        categoryName="Perfumes"
        onClose={onClose}
        onAddToCart={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(onClose).toHaveBeenCalled();
  });
});
