import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useCartStore } from '../store/cart-store';
import { CartDrawer } from './cart-drawer';

describe('CartDrawer', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it('shows the total item count as a badge on the trigger', () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-2', name: 'Glamour Noir', imageUrl: null },
        1,
      );

    render(<CartDrawer whatsappNumber="+5511999999999" />);

    expect(
      screen.getByRole('button', { name: /Ver carrinho.*3/ }),
    ).toBeInTheDocument();
  });

  it('does not render the panel before the trigger is clicked', () => {
    render(<CartDrawer whatsappNumber="+5511999999999" />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the panel listing cart items when the trigger is clicked', async () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    render(<CartDrawer whatsappNumber="+5511999999999" />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
  });

  it('removes an item when its remove button is clicked', async () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    render(<CartDrawer whatsappNumber="+5511999999999" />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Remover Eggeo Blossom' }),
    );

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('updates the item quantity in the store when the stepper is used', async () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    render(<CartDrawer whatsappNumber="+5511999999999" />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    );

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('shows an empty-cart message and no checkout link when there are no items', async () => {
    render(<CartDrawer whatsappNumber="+5511999999999" />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));

    expect(screen.getByText('Seu carrinho está vazio.')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /Finalizar no WhatsApp/ }),
    ).not.toBeInTheDocument();
  });

  it('renders a WhatsApp checkout link with the built wa.me url when the number is verified', async () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    render(<CartDrawer whatsappNumber="+5511999999999" />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));

    const link = screen.getByRole('link', { name: /Finalizar no WhatsApp/ });
    expect(link.getAttribute('href')).toContain('https://wa.me/5511999999999');
    expect(link.getAttribute('href')).toContain(
      encodeURIComponent('2x Eggeo Blossom'),
    );
  });

  it('disables checkout with an explanation when whatsappNumber is null, without losing the cart', async () => {
    useCartStore
      .getState()
      .addItem(
        { productId: 'prod-1', name: 'Eggeo Blossom', imageUrl: null },
        2,
      );

    render(<CartDrawer whatsappNumber={null} />);
    await userEvent.click(screen.getByRole('button', { name: /Ver carrinho/ }));

    expect(
      screen.queryByRole('link', { name: /Finalizar no WhatsApp/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(/loja ainda não confirmou o WhatsApp/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Eggeo Blossom')).toBeInTheDocument();
  });
});
