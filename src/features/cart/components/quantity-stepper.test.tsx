import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuantityStepper } from './quantity-stepper';

describe('QuantityStepper', () => {
  it('shows the current quantity', () => {
    render(<QuantityStepper quantity={2} onChange={vi.fn()} />);

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onChange with quantity + 1 when the increment button is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper quantity={2} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    );

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('calls onChange with quantity - 1 when the decrement button is clicked', async () => {
    const onChange = vi.fn();
    render(<QuantityStepper quantity={2} onChange={onChange} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Diminuir quantidade' }),
    );

    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('disables the decrement button when quantity is at the given min (default 1)', () => {
    render(<QuantityStepper quantity={1} onChange={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Diminuir quantidade' }),
    ).toBeDisabled();
  });

  it('disables the increment button once quantity reaches the given max', () => {
    render(<QuantityStepper quantity={5} onChange={vi.fn()} max={5} />);

    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    ).toBeDisabled();
  });

  it('keeps the increment button enabled below the given max', () => {
    render(<QuantityStepper quantity={4} onChange={vi.fn()} max={5} />);

    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    ).toBeEnabled();
  });

  it('disables both buttons when disabled is true', () => {
    render(<QuantityStepper quantity={2} onChange={vi.fn()} disabled />);

    expect(
      screen.getByRole('button', { name: 'Aumentar quantidade' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Diminuir quantidade' }),
    ).toBeDisabled();
  });
});
