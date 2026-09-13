import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StorefrontHeader } from './storefront-header';

describe('StorefrontHeader', () => {
  it('renders the store name', () => {
    render(<StorefrontHeader name="Loja da Ana" instagramHandle={null} />);

    expect(
      screen.getByRole('heading', { name: 'Loja da Ana' }),
    ).toBeInTheDocument();
  });

  it('links to the Instagram profile when a handle is present', () => {
    render(<StorefrontHeader name="Loja da Ana" instagramHandle="lojadaana" />);

    const link = screen.getByRole('link', { name: '@lojadaana' });
    expect(link).toHaveAttribute('href', 'https://instagram.com/lojadaana');
  });

  it('renders no Instagram link when the handle is null', () => {
    render(<StorefrontHeader name="Loja da Ana" instagramHandle={null} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
