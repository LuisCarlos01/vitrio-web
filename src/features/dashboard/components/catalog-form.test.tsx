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
  logoUrl: null,
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

  it("shows the catalog's current logo when one is already set", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([
          { ...catalogDto, logoUrl: 'https://cdn.example.com/logo.png' },
        ]),
      ),
    );
    renderCatalogForm();

    expect(await screen.findByAltText(/logo atual/i)).toHaveAttribute(
      'src',
      'https://cdn.example.com/logo.png',
    );
  });

  it('shows no logo preview when the catalog has none yet', async () => {
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');

    expect(screen.queryByAltText(/logo atual/i)).not.toBeInTheDocument();
  });

  it('uploads the chosen logo file and saves it as the catalog logo', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/assets`, () =>
        HttpResponse.json({
          id: 'asset-1',
          catalogId: 'catalog-1',
          contentType: 'image/png',
          byteSize: 4,
          publicUrl: 'https://cdn.example.com/asset-1.png',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({
            ...catalogDto,
            logoUrl: 'https://cdn.example.com/asset-1.png',
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    const file = new File(['fake'], 'logo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/^logo$/i), file);
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(receivedBody).toMatchObject({ logoAssetId: 'asset-1' }),
    );
    expect(await screen.findByAltText(/logo atual/i)).toHaveAttribute(
      'src',
      'https://cdn.example.com/asset-1.png',
    );
  });

  it('resends the already-uploaded logoAssetId when the PATCH fails and the reseller retries', async () => {
    let patchAttempts = 0;
    const receivedBodies: unknown[] = [];
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/assets`, () =>
        HttpResponse.json({
          id: 'asset-1',
          catalogId: 'catalog-1',
          contentType: 'image/png',
          byteSize: 4,
          publicUrl: 'https://cdn.example.com/asset-1.png',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1`,
        async ({ request }) => {
          patchAttempts += 1;
          receivedBodies.push(await request.json());
          if (patchAttempts === 1) {
            return HttpResponse.json(
              { message: 'server error' },
              { status: 500 },
            );
          }
          return HttpResponse.json({
            ...catalogDto,
            logoUrl: 'https://cdn.example.com/asset-1.png',
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    const file = new File(['fake'], 'logo.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/^logo$/i), file);

    // primeira tentativa: falha
    await user.click(screen.getByRole('button', { name: /salvar/i }));
    await screen.findByText(/não foi possível salvar/i);

    // segunda tentativa: sem escolher o arquivo de novo
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(patchAttempts).toBe(2));
    expect(receivedBodies[0]).toMatchObject({ logoAssetId: 'asset-1' });
    expect(receivedBodies[1]).toMatchObject({ logoAssetId: 'asset-1' });
  });

  it('saves without touching the logo when no new file is chosen', async () => {
    let receivedBody: unknown;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...catalogDto, name: 'Loja Nova' });
        },
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(receivedBody).not.toHaveProperty('logoAssetId'));
  });

  it('saves the hex codes of the curated palette chosen in the color picker', async () => {
    let receivedBody: unknown;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({
            ...catalogDto,
            primaryColorHex: '#111827',
            buttonColorHex: '#F59E0B',
          });
        },
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    await user.click(screen.getByRole('radio', { name: /noturno/i }));
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(receivedBody).toMatchObject({
        primaryColorHex: '#111827',
        buttonColorHex: '#F59E0B',
      }),
    );
  });

  it('warns about low contrast when the chosen palette is hard to read, without blocking submission', async () => {
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1`, () =>
        HttpResponse.json({
          ...catalogDto,
          primaryColorHex: '#DB2777',
          buttonColorHex: '#7C3AED',
        }),
      ),
    );
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    await user.click(screen.getByRole('radio', { name: /vibrante/i }));

    expect(screen.getByText(/pode ficar difícil de ler/i)).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: /salvar/i });
    expect(saveButton).not.toBeDisabled();
    await user.click(saveButton);

    await waitFor(() => expect(saveButton).not.toBeDisabled());
  });

  it('shows no contrast warning for a high-contrast curated palette', async () => {
    const user = userEvent.setup();
    renderCatalogForm();

    await screen.findByDisplayValue('Loja da Ana');
    await user.click(screen.getByRole('radio', { name: /noturno/i }));

    expect(
      screen.queryByText(/pode ficar difícil de ler/i),
    ).not.toBeInTheDocument();
  });

  it('defaults to the first curated palette when the catalog has no color set yet', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([
          { ...catalogDto, primaryColorHex: null, buttonColorHex: null },
        ]),
      ),
    );
    renderCatalogForm();

    expect(
      await screen.findByRole('radio', { name: /clássico/i }),
    ).toBeChecked();
  });

  it('preserves a valid color when only the other one comes back null', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([
          { ...catalogDto, primaryColorHex: '#DB2777', buttonColorHex: null },
        ]),
      ),
    );
    renderCatalogForm();

    expect(
      await screen.findByLabelText(/cor primária \(avançado\)/i),
    ).toHaveValue('#db2777');
  });

  it('treats the backend\'s neutral placeholder colors as "no color chosen yet"', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([
          {
            ...catalogDto,
            primaryColorHex: '#6D28D9',
            buttonColorHex: '#059669',
          },
        ]),
      ),
    );
    renderCatalogForm();

    expect(
      await screen.findByRole('radio', { name: /clássico/i }),
    ).toBeChecked();
    expect(
      screen.queryByText(/pode ficar difícil de ler/i),
    ).not.toBeInTheDocument();
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
