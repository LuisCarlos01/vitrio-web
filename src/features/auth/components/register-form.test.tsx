import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { RegisterForm } from './register-form';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderRegisterForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <RegisterForm />
    </QueryClientProvider>,
  );
}

describe('RegisterForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('shows validation errors and never calls the API when the form is submitted empty', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    expect(
      screen.getByText(/senha deve ter pelo menos 8 caracteres/i),
    ).toBeInTheDocument();

    // Nenhum handler de MSW foi registrado para este teste; o server global
    // (onUnhandledRequest: "error") derruba o teste se o formulário chamar a
    // API mesmo assim — a ausência de erro aqui é a prova de que não chamou.
  });

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'new-reseller@example.com',
    );
    await user.type(screen.getByLabelText(/senha/i), 'short1');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(
      await screen.findByText(/senha deve ter pelo menos 8 caracteres/i),
    ).toBeInTheDocument();
  });

  it('registers and redirects to the dashboard when submitted with valid data', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' }),
      ),
    );
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'new-reseller@example.com',
    );
    await user.type(screen.getByLabelText(/senha/i), 'correct-horse-battery');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows an email-already-registered error and does not redirect on 409', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json(
          { message: 'Email already registered' },
          { status: 409 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'correct-horse-battery');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(
      await screen.findByText(/este e-mail já está cadastrado/i),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a rate-limit-friendly message and does not redirect on 429', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'new-reseller@example.com',
    );
    await user.type(screen.getByLabelText(/senha/i), 'correct-horse-battery');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText(/muitas tentativas/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('disables the submit button while the register request is in flight', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/register`, async () => {
        await delay(50);
        return HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' });
      }),
    );
    const user = userEvent.setup();
    renderRegisterForm();

    await user.type(
      screen.getByLabelText(/e-mail/i),
      'new-reseller@example.com',
    );
    await user.type(screen.getByLabelText(/senha/i), 'correct-horse-battery');
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });
});
