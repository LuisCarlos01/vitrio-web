import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { CsvImportForm } from './csv-import-form';

function renderCsvImportForm() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CsvImportForm catalogId="catalog-1" />
    </QueryClientProvider>,
  );
}

describe('CsvImportForm', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  afterEach(cleanup);

  it('previews a CSV and shows valid/invalid rows before confirming', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/preview`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                errors: [],
              },
              {
                lineNumber: 3,
                name: '',
                sku: null,
                description: null,
                imageUrl: '',
                errors: ['Nome é obrigatório', 'Imagem é obrigatória'],
              },
            ],
          }),
      ),
    );

    const user = userEvent.setup();
    renderCsvImportForm();

    const file = new File(
      [
        'nome,codigo,descricao,imagem\nPerfume X,PRF-001,,https://example.com/x.png\n',
      ],
      'produtos.csv',
      { type: 'text/csv' },
    );
    await user.upload(screen.getByLabelText(/arquivo csv/i), file);
    await user.click(screen.getByRole('button', { name: /pré-visualizar/i }));

    expect(await screen.findByText('Perfume X')).toBeInTheDocument();
    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /confirmar importação/i }),
    ).toBeEnabled();
  });

  it('translates the API validation errors to pt-BR, falling back to the original text when unmapped', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/preview`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 3,
                name: '',
                sku: null,
                description: null,
                imageUrl: '',
                errors: ['name is required', 'a brand new unmapped error'],
              },
            ],
          }),
      ),
    );

    const user = userEvent.setup();
    renderCsvImportForm();

    const file = new File(
      ['nome,codigo,descricao,imagem\n,,,\n'],
      'produtos.csv',
      { type: 'text/csv' },
    );
    await user.upload(screen.getByLabelText(/arquivo csv/i), file);
    await user.click(screen.getByRole('button', { name: /pré-visualizar/i }));

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('a brand new unmapped error')).toBeInTheDocument();
  });

  it('confirms the import and shows which rows were created', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/preview`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                errors: [],
              },
            ],
          }),
      ),
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/confirm`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                productId: 'p1',
                errors: [],
              },
            ],
          }),
      ),
    );

    const user = userEvent.setup();
    renderCsvImportForm();

    const file = new File(
      [
        'nome,codigo,descricao,imagem\nPerfume X,PRF-001,,https://example.com/x.png\n',
      ],
      'produtos.csv',
      { type: 'text/csv' },
    );
    await user.upload(screen.getByLabelText(/arquivo csv/i), file);
    await user.click(screen.getByRole('button', { name: /pré-visualizar/i }));
    await screen.findByText('Perfume X');

    await user.click(
      screen.getByRole('button', { name: /confirmar importação/i }),
    );

    expect(await screen.findByText(/criado/i)).toBeInTheDocument();
  });

  it('shows a rate-limit-friendly message when confirming is rejected with 429', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/preview`,
        () =>
          HttpResponse.json({
            rows: [
              {
                lineNumber: 2,
                name: 'Perfume X',
                sku: 'PRF-001',
                description: null,
                imageUrl: 'https://example.com/x.png',
                errors: [],
              },
            ],
          }),
      ),
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/confirm`,
        () =>
          HttpResponse.json({ message: 'Too many requests' }, { status: 429 }),
      ),
    );

    const user = userEvent.setup();
    renderCsvImportForm();

    const file = new File(
      [
        'nome,codigo,descricao,imagem\nPerfume X,PRF-001,,https://example.com/x.png\n',
      ],
      'produtos.csv',
      { type: 'text/csv' },
    );
    await user.upload(screen.getByLabelText(/arquivo csv/i), file);
    await user.click(screen.getByRole('button', { name: /pré-visualizar/i }));
    await screen.findByText('Perfume X');

    await user.click(
      screen.getByRole('button', { name: /confirmar importação/i }),
    );

    expect(await screen.findByText(/muitas tentativas/i)).toBeInTheDocument();
  });

  it('disables picking a new file while a preview is in flight, so confirm can never target a different file', async () => {
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/import/preview`,
        async () => {
          await delay(30);
          return HttpResponse.json({ rows: [] });
        },
      ),
    );

    const user = userEvent.setup();
    renderCsvImportForm();

    const file = new File(['a'], 'a.csv', { type: 'text/csv' });
    const input = screen.getByLabelText(/arquivo csv/i);
    await user.upload(input, file);
    await user.click(screen.getByRole('button', { name: /pré-visualizar/i }));

    expect(input).toBeDisabled();

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /pré-visualizar/i }),
      ).toBeEnabled(),
    );
    expect(input).toBeEnabled();
  });
});
