import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorPalettePicker } from './color-palette-picker';

describe('ColorPalettePicker', () => {
  it('pre-selects the curated palette matching the current colors', () => {
    render(
      <ColorPalettePicker
        primaryColorHex="#DB2777"
        buttonColorHex="#7C3AED"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /vibrante/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /avançado/i })).not.toBeChecked();
  });

  it('falls back to "Avançado" when the colors do not match any curated palette', () => {
    render(
      <ColorPalettePicker
        primaryColorHex="#FF00FF"
        buttonColorHex="#00FF00"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('radio', { name: /avançado/i })).toBeChecked();
    expect(screen.getByLabelText(/cor primária \(avançado\)/i)).toHaveValue(
      '#ff00ff',
    );
    expect(screen.getByLabelText(/cor do botão \(avançado\)/i)).toHaveValue(
      '#00ff00',
    );
  });

  it('applies both hex codes of the chosen curated palette on selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ColorPalettePicker
        primaryColorHex="#FF00FF"
        buttonColorHex="#00FF00"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: /noturno/i }));

    expect(onChange).toHaveBeenCalledWith({
      primaryColorHex: '#111827',
      buttonColorHex: '#F59E0B',
    });
  });

  it('lets the user fine-tune a curated palette swatch without leaving that palette', async () => {
    const onChange = vi.fn();
    render(
      <ColorPalettePicker
        primaryColorHex="#DB2777"
        buttonColorHex="#7C3AED"
        onChange={onChange}
      />,
    );

    const primarySwatch = screen.getByLabelText(/cor primária de vibrante/i);
    fireEvent.change(primarySwatch, { target: { value: '#ab00ab' } });

    expect(onChange).toHaveBeenCalledWith({
      primaryColorHex: '#ab00ab',
      buttonColorHex: '#7C3AED',
    });
  });

  it('reveals editable custom color inputs when "Avançado" is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <ColorPalettePicker
        primaryColorHex="#DB2777"
        buttonColorHex="#7C3AED"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('radio', { name: /avançado/i }));

    expect(onChange).toHaveBeenCalledWith({
      primaryColorHex: '#DB2777',
      buttonColorHex: '#7C3AED',
    });
    expect(
      screen.getByLabelText(/cor primária \(avançado\)/i),
    ).toBeInTheDocument();
  });
});
