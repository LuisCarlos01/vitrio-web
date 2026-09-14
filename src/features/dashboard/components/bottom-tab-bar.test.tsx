import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BottomTabBar } from './bottom-tab-bar';

const usePathnameMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
}));

describe('BottomTabBar', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/dashboard');
  });

  it('renders only the 4 mobile destinations, excluding Categorias', () => {
    render(<BottomTabBar />);

    for (const label of ['Catálogo', 'Produtos', 'Loja', 'WhatsApp']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(
      screen.queryByRole('link', { name: 'Categorias' }),
    ).not.toBeInTheDocument();
  });

  it('marks the link matching the current pathname as the active page', () => {
    usePathnameMock.mockReturnValue('/store');
    render(<BottomTabBar />);

    expect(screen.getByRole('link', { name: 'Loja' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Produtos' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('positions the active-tab indicator over the active item, by index among the 4 mobile items', () => {
    usePathnameMock.mockReturnValue('/whatsapp');
    render(<BottomTabBar />);

    const indicator = screen.getByTestId('active-tab-indicator');
    // WhatsApp é o 4º dos 4 itens mobile (índice 3) => 75%.
    expect(indicator.style.left).toBe('75%');
  });

  it('positions the indicator at 0% when the first item is active', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<BottomTabBar />);

    expect(screen.getByTestId('active-tab-indicator').style.left).toBe('0%');
  });
});
