import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ProductPhotoViewer } from './product-photo-viewer';

describe('ProductPhotoViewer', () => {
  it('renders nothing when the product has no photo', () => {
    render(
      <ProductPhotoViewer
        product={{ name: 'Perfume X', imageUrl: null }}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows nothing when closed', () => {
    render(
      <ProductPhotoViewer
        product={{
          name: 'Perfume X',
          imageUrl: 'https://cdn.example.com/p.png',
        }}
        open={false}
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the photo in both the desktop modal and the mobile sheet when open', () => {
    render(
      <ProductPhotoViewer
        product={{
          name: 'Perfume X',
          imageUrl: 'https://cdn.example.com/p.png',
        }}
        open={true}
        onOpenChange={vi.fn()}
      />,
    );

    const modal = screen.getByTestId('product-photo-modal');
    const sheet = screen.getByTestId('product-photo-sheet');
    expect(modal.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/p.png',
    );
    expect(sheet.querySelector('img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/p.png',
    );
  });

  it('closes the mobile sheet through its own close button', async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ProductPhotoViewer
        product={{
          name: 'Perfume X',
          imageUrl: 'https://cdn.example.com/p.png',
        }}
        open={true}
        onOpenChange={onOpenChange}
      />,
    );

    const sheet = screen.getByTestId('product-photo-sheet');
    await user.click(
      sheet.querySelector('[data-slot="dialog-close"]') as HTMLElement,
    );

    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });
});
