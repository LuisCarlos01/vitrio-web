import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StorefrontHeader } from './storefront-header';

describe('StorefrontHeader', () => {
  it('renders the store name', () => {
    render(
      <StorefrontHeader
        name="Loja da Ana"
        logoUrl={null}
        instagramHandle={null}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Loja da Ana' }),
    ).toBeInTheDocument();
  });

  it('links to the Instagram profile when a handle is present', () => {
    render(
      <StorefrontHeader
        name="Loja da Ana"
        logoUrl={null}
        instagramHandle="lojadaana"
      />,
    );

    const link = screen.getByRole('link', { name: '@lojadaana' });
    expect(link).toHaveAttribute('href', 'https://instagram.com/lojadaana');
  });

  it('renders no Instagram link when the handle is null', () => {
    render(
      <StorefrontHeader
        name="Loja da Ana"
        logoUrl={null}
        instagramHandle={null}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the store logo when logoUrl is present', () => {
    render(
      <StorefrontHeader
        name="Loja da Ana"
        logoUrl="https://cdn.example.com/logo.png"
        instagramHandle={null}
      />,
    );

    expect(screen.getByRole('img', { name: 'Loja da Ana' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/logo.png',
    );
  });

  it('renders no logo image when logoUrl is null', () => {
    render(
      <StorefrontHeader
        name="Loja da Ana"
        logoUrl={null}
        instagramHandle={null}
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
