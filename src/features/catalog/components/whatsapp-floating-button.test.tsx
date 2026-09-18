import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhatsappFloatingButton } from './whatsapp-floating-button';

describe('WhatsappFloatingButton', () => {
  it('renders a link to a general (non-product) WhatsApp chat using the store number', () => {
    render(
      <WhatsappFloatingButton
        storeName="Loja da Ana"
        whatsappNumber="+5511999999999"
        buttonColorHex="#111827"
      />,
    );

    const link = screen.getByRole('link', { name: /Falar no WhatsApp/ });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/5511999999999'),
    );
  });

  it('names the store in the prefilled message', () => {
    render(
      <WhatsappFloatingButton
        storeName="Loja da Ana"
        whatsappNumber="+5511999999999"
        buttonColorHex="#111827"
      />,
    );

    const link = screen.getByRole('link', { name: /Falar no WhatsApp/ });
    expect(decodeURIComponent(link.getAttribute('href') ?? '')).toContain(
      'Loja da Ana',
    );
  });

  it('uses the store buttonColorHex as background, never the WhatsApp brand green', () => {
    render(
      <WhatsappFloatingButton
        storeName="Loja da Ana"
        whatsappNumber="+5511999999999"
        buttonColorHex="#111827"
      />,
    );

    const link = screen.getByRole('link', { name: /Falar no WhatsApp/ });
    expect(link.style.backgroundColor).toBe('rgb(17, 24, 39)');
  });

  it('picks a readable text color for the chosen background', () => {
    render(
      <WhatsappFloatingButton
        storeName="Loja da Ana"
        whatsappNumber="+5511999999999"
        buttonColorHex="#111827"
      />,
    );

    const link = screen.getByRole('link', { name: /Falar no WhatsApp/ });
    expect(link.style.color).toBe('rgb(255, 255, 255)');
  });

  it('renders nothing when the store WhatsApp number is unverified (null)', () => {
    render(
      <WhatsappFloatingButton
        storeName="Loja da Ana"
        whatsappNumber={null}
        buttonColorHex="#111827"
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
