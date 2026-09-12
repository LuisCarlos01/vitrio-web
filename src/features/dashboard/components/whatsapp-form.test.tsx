import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { WhatsappForm } from './whatsapp-form';

function catalogDto(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'catalog-1',
    name: 'Loja da Ana',
    slug: 'loja-da-ana',
    primaryColorHex: null,
    buttonColorHex: null,
    instagramHandle: null,
    whatsappNumber: null,
    whatsappVerificationStatus: 'UNVERIFIED' as const,
    whatsappVerifiedAt: null,
    createdAt: '2025-12-01T00:00:00Z',
    ...overrides,
  };
}

function renderWhatsappForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <WhatsappForm />
    </QueryClientProvider>,
  );
}

describe('WhatsappForm', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('shows no number configured and no verify button when the catalog has none', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto()]),
      ),
    );
    renderWhatsappForm();

    await screen.findByRole('button', { name: /salvar/i });
    expect(
      screen.queryByRole('button', { name: /verificar/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the configured number as unverified with a verify button', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto({ whatsappNumber: '5511912345678' })]),
      ),
    );
    renderWhatsappForm();

    expect(
      await screen.findByDisplayValue('5511912345678'),
    ).toBeInTheDocument();
    expect(screen.getByText(/não verificado/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /verificar/i }),
    ).toBeInTheDocument();
  });

  it('shows a verified badge and no verify button when already verified', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([
          catalogDto({
            whatsappNumber: '5511912345678',
            whatsappVerificationStatus: 'VERIFIED',
          }),
        ]),
      ),
    );
    renderWhatsappForm();

    await screen.findByDisplayValue('5511912345678');
    expect(screen.getByText(/^verificado$/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /verificar/i }),
    ).not.toBeInTheDocument();
  });

  it('saves a new number and shows it as unverified again', async () => {
    let current = catalogDto({
      whatsappNumber: '5511912345678',
      whatsappVerificationStatus: 'VERIFIED',
    });
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([current]),
      ),
      http.put(`${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp`, () => {
        current = catalogDto({ whatsappNumber: '5511999998888' });
        return HttpResponse.json(current);
      }),
    );
    const user = userEvent.setup();
    renderWhatsappForm();

    const numberInput = await screen.findByDisplayValue('5511912345678');
    await user.clear(numberInput);
    await user.type(numberInput, '5511999998888');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(
      await screen.findByDisplayValue('5511999998888'),
    ).toBeInTheDocument();
    expect(screen.getByText(/não verificado/i)).toBeInTheDocument();
  });

  it('shows an error message when saving an invalid number', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([catalogDto()]),
      ),
    );
    server.use(
      http.put(`${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp`, () =>
        HttpResponse.json(
          { message: 'Invalid WhatsApp number' },
          { status: 400 },
        ),
      ),
    );
    const user = userEvent.setup();
    renderWhatsappForm();

    const numberInput = await screen.findByLabelText(/whatsapp/i);
    await user.type(numberInput, 'not-a-number');
    await user.click(screen.getByRole('button', { name: /salvar/i }));

    expect(
      await screen.findByText(/não foi possível salvar/i),
    ).toBeInTheDocument();
  });

  it('marks the number as verified after clicking verify', async () => {
    let current = catalogDto({ whatsappNumber: '5511912345678' });
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs`, () =>
        HttpResponse.json([current]),
      ),
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/whatsapp/verify`,
        () => {
          current = catalogDto({
            whatsappNumber: '5511912345678',
            whatsappVerificationStatus: 'VERIFIED',
          });
          return HttpResponse.json(current);
        },
      ),
    );
    const user = userEvent.setup();
    renderWhatsappForm();

    await user.click(await screen.findByRole('button', { name: /verificar/i }));

    expect(await screen.findByText(/^verificado$/i)).toBeInTheDocument();
  });
});
