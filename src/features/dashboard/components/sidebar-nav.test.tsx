import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SidebarNav } from './sidebar-nav';

const usePathnameMock = vi.hoisted(() => vi.fn());
const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  usePathname: usePathnameMock,
  useRouter: () => ({ push: pushMock }),
}));

describe('SidebarNav', () => {
  beforeEach(() => {
    usePathnameMock.mockReturnValue('/dashboard');
  });

  it('renders a link for every one of the 5 destinations', () => {
    render(<SidebarNav />);

    for (const label of [
      'Catálogo',
      'Produtos',
      'Loja',
      'WhatsApp',
      'Categorias',
    ]) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('marks the link matching the current pathname as the active page', () => {
    usePathnameMock.mockReturnValue('/products');
    render(<SidebarNav />);

    expect(screen.getByRole('link', { name: 'Produtos' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Loja' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('renders both logo variants (light/dark background) for CSS to pick via the dark: variant', () => {
    render(<SidebarNav />);

    expect(screen.getAllByAltText('Vitrio')).toHaveLength(2);
  });

  it('starts expanded, showing each label visibly (not screen-reader-only)', () => {
    render(<SidebarNav />);

    const label = screen.getByText('Produtos');
    expect(label).not.toHaveClass('sr-only');
  });

  it('collapses to icon-only (labels become screen-reader-only) when the toggle is clicked', async () => {
    render(<SidebarNav />);

    await userEvent.click(
      screen.getByRole('button', { name: /recolher menu/i }),
    );

    expect(screen.getByText('Produtos')).toHaveClass('sr-only');
  });

  it('swaps the wordmark logo for the icon-only variant when collapsed', async () => {
    render(<SidebarNav />);

    await userEvent.click(
      screen.getByRole('button', { name: /recolher menu/i }),
    );

    const logos = screen.getAllByAltText('Vitrio');
    expect(
      logos.every((img) => img.getAttribute('src')?.includes('icon-')),
    ).toBe(true);
  });

  it('expands again (labels visible) when the toggle is clicked twice', async () => {
    render(<SidebarNav />);

    const toggle = screen.getByRole('button', { name: /recolher menu/i });
    await userEvent.click(toggle);
    await userEvent.click(
      screen.getByRole('button', { name: /expandir menu/i }),
    );

    expect(screen.getByText('Produtos')).not.toHaveClass('sr-only');
  });
});
