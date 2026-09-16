import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { LoginForm } from './login-form';

const pushMock = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

function renderLoginForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <LoginForm />
    </QueryClientProvider>,
  );
}

describe('LoginForm', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('shows validation errors and never calls the API when the form is submitted empty', async () => {
    const user = userEvent.setup();
    renderLoginForm();

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/e-mail inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();

    // Nenhum handler de MSW foi registrado para este teste; o server global
    // (onUnhandledRequest: "error") derruba o teste se o formulário chamar a
    // API mesmo assim — a ausência de erro aqui é a prova de que não chamou.
  });

  it('logs in and redirects to the dashboard when submitted with valid credentials', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' }),
      ),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'reseller@example.com');
    await user.type(
      screen.getByLabelText(/senha/i, { selector: 'input' }),
      'correct-horse',
    );
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });

  it('shows an invalid-credentials error and does not redirect on 401', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'reseller@example.com');
    await user.type(
      screen.getByLabelText(/senha/i, { selector: 'input' }),
      'wrong-password',
    );
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(
      await screen.findByText(/e-mail ou senha inválidos/i),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a rate-limit-friendly message and does not redirect on 429', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'reseller@example.com');
    await user.type(
      screen.getByLabelText(/senha/i, { selector: 'input' }),
      'correct-horse',
    );
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText(/muitas tentativas/i)).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('shows a generic connection error and does not redirect when the request fails before reaching the API', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.error(),
      ),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'reseller@example.com');
    await user.type(
      screen.getByLabelText(/senha/i, { selector: 'input' }),
      'correct-horse',
    );
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(
      await screen.findByText(/não foi possível conectar/i),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('disables the submit button while the login request is in flight', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/auth/login`, async () => {
        await delay(50);
        return HttpResponse.json({ accessToken: 'abc', refreshToken: 'def' });
      }),
    );
    const user = userEvent.setup();
    renderLoginForm();

    await user.type(screen.getByLabelText(/e-mail/i), 'reseller@example.com');
    await user.type(
      screen.getByLabelText(/senha/i, { selector: 'input' }),
      'correct-horse',
    );
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith('/dashboard'));
  });
});
