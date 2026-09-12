import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { CatalogForm } from './catalog-form';

const catalogDto = {
  id: 'catalog-1',
  name: 'Loja da Ana',
  slug: 'loja-da-ana',
  primaryColorHex: '#FF00FF',
  buttonColorHex: '#00FF00',
  instagramHandle: 'lojadaana',
  whatsappNumber: null,
  whatsappVerificationStatus: 'UNVERIFIED' as const,
  whatsappVerifiedAt: null,
  createdAt: '2025-12-01T00:00:00Z',
};

function renderCatalogForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CatalogForm />
    </QueryClientProvider>,
  );
}

describe('CatalogForm', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto]),
      ),
    );
  });

  it('shows a loading state before the catalog data arrives', () => {
    renderCatalogForm();

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
  });

  it("shows the catalog's current data once loaded, with slug read-only", async () => {
    renderCatalogForm();

    expect(await screen.findByDisplayValue('Loja da Ana')).toBeInTheDocument();
    expect(screen.getByText('loja-da-ana')).toBeInTheDocument();
    expect(screen.queryByLabelText(/slug/i)?.tagName).not.toBe('INPUT');
  });

  it('saves the edited name and reflects the update', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, () =>
        HttpResponse.json({ ...catalogDto, name: 'Loja Nova' }),
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    const nameInput = await screen.findByDisplayValue('Loja da Ana');
    await user.clear(nameInput);
    await user.type(nameInput, 'Loja Nova');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByDisplayValue('Loja Nova')).toBeInTheDocument();
  });

  it('shows an error message when the API rejects the update', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, () =>
        HttpResponse.json({ message: 'invalid color' }, { status: 400 }),
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(
      await screen.findByText(/não foi possível salvar/i),
    ).toBeInTheDocument();
  });

  it('shows a create-store form when the account has no catalog yet', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () => HttpResponse.json([])),
    );
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json(catalogDto),
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    const createNameInput =
      await screen.findByLabelText(/nome da (sua )?loja/i);
    await user.type(createNameInput, 'Loja da Ana');
    await user.click(screen.getByRole('button', { name: /criar loja/i }));

    expect(await screen.findByDisplayValue('Loja da Ana')).toBeInTheDocument();
  });

  it('disables the save button while the update request is in flight', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json(catalogDto);
      }),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);

    expect(saveButton).toBeDisabled();

    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });
});
