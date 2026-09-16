import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './password-input';

describe('PasswordInput', () => {
  it('hides the password by default', () => {
    render(<PasswordInput aria-label="Senha" />);

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });

  it('reveals the password as plain text when the toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Senha" />);

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'text');
  });

  it('hides the password again when the toggle is clicked twice', async () => {
    const user = userEvent.setup();
    render(<PasswordInput aria-label="Senha" />);

    await user.click(screen.getByRole('button', { name: /mostrar senha/i }));
    await user.click(screen.getByRole('button', { name: /ocultar senha/i }));

    expect(screen.getByLabelText('Senha')).toHaveAttribute('type', 'password');
  });
});
