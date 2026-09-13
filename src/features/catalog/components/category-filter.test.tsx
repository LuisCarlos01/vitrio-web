import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CategoryFilter } from './category-filter';

const categories = [
  { id: 'cat-1', name: 'Perfumes' },
  { id: 'cat-2', name: 'Maquiagem' },
];

describe('CategoryFilter', () => {
  it('renders an "Todos" chip plus one chip per category', () => {
    render(
      <CategoryFilter
        categories={categories}
        activeCategoryId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Todos' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Perfumes' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Maquiagem' }),
    ).toBeInTheDocument();
  });

  it('marks the active chip pressed via aria-pressed', () => {
    render(
      <CategoryFilter
        categories={categories}
        activeCategoryId="cat-1"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Perfumes' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls onSelect with the category id when a chip is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={categories}
        activeCategoryId={null}
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Maquiagem' }));

    expect(onSelect).toHaveBeenCalledWith('cat-2');
  });

  it('calls onSelect with null when the "Todos" chip is clicked', async () => {
    const onSelect = vi.fn();
    render(
      <CategoryFilter
        categories={categories}
        activeCategoryId="cat-1"
        onSelect={onSelect}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));

    expect(onSelect).toHaveBeenCalledWith(null);
  });
});
