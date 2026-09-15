import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import type { Catalog } from '@/lib/api/adapters/catalog';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { DashboardOverview } from './dashboard-overview';

const CATALOG_ID = 'catalog-1';

function buildCatalog(overrides: Partial<Catalog> = {}): Catalog {
  return {
    id: CATALOG_ID,
    name: 'Loja da Ana',
    slug: 'loja-da-ana',
    primaryColorHex: null,
    buttonColorHex: null,
    instagramHandle: null,
    whatsappNumber: null,
    isWhatsappVerified: false,
    whatsappVerifiedAt: null,
    logoUrl: null,
    ...overrides,
  };
}

function rawProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 'prod-1',
    catalogId: CATALOG_ID,
    name: 'Eggeo Blossom',
    sku: 'EGG-01',
    description: null,
    imageAssetId: 'asset-1',
    categoryId: 'cat-1',
    quantityAvailable: 5,
    isVisible: true,
    isOrderable: true,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    ...overrides,
  };
}

function mockMe(name: string | null) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/users/me`, () =>
      HttpResponse.json({ id: 'user-1', email: 'ana@example.com', name }),
    ),
  );
}

function mockProducts(products: ReturnType<typeof rawProduct>[]) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/${CATALOG_ID}/products`, () =>
      HttpResponse.json(products),
    ),
  );
}

function mockCategories(categories: { id: string; name: string }[]) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/${CATALOG_ID}/categories`, () =>
      HttpResponse.json(
        categories.map((c) => ({
          ...c,
          catalogId: CATALOG_ID,
          createdAt: '2026-09-01T00:00:00Z',
        })),
      ),
    ),
  );
}

function mockLatestImport(
  body: {
    catalogId: string;
    confirmedAt: string;
    acceptedCount: number;
    rejectedCount: number;
  } | null,
) {
  server.use(
    http.get(
      `${API_BASE_URL}/api/v1/catalogs/${CATALOG_ID}/imports/latest`,
      () =>
        body === null
          ? new HttpResponse(null, { status: 204 })
          : HttpResponse.json(body),
    ),
  );
}

function renderOverview(catalog: Catalog) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardOverview catalog={catalog} />
    </QueryClientProvider>,
  );
}

describe('DashboardOverview', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
    mockProducts([rawProduct()]);
    mockCategories([{ id: 'cat-1', name: 'Perfumes' }]);
    mockLatestImport(null);
  });

  it('shows a loading state instead of treating pending queries as empty data', () => {
    mockMe('Ana Souza');
    server.use(
      http.get(
        `${API_BASE_URL}/api/v1/catalogs/${CATALOG_ID}/products`,
        () => new Promise(() => {}),
      ),
    );
    renderOverview(buildCatalog());

    expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    expect(screen.queryByText('Produtos ativos')).not.toBeInTheDocument();
  });

  it('shows an error state instead of rendering zeroed-out cards when a query fails', async () => {
    mockMe('Ana Souza');
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/${CATALOG_ID}/products`, () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    renderOverview(buildCatalog());

    expect(
      await screen.findByText(/não foi possível carregar/i),
    ).toBeInTheDocument();
    expect(screen.queryByText('Produtos ativos')).not.toBeInTheDocument();
  });

  it('greets the account by name when set', async () => {
    mockMe('Ana Souza');
    renderOverview(buildCatalog());

    expect(
      await screen.findByRole('heading', { name: /olá, ana souza/i }),
    ).toBeInTheDocument();
  });

  it('falls back to the email local-part when the account has no name', async () => {
    mockMe(null);
    renderOverview(buildCatalog());

    expect(
      await screen.findByRole('heading', { name: /olá, ana/i }),
    ).toBeInTheDocument();
  });

  it('shows active product count and how many have no photo', async () => {
    mockMe('Ana Souza');
    mockProducts([
      rawProduct({ id: 'p1', isActive: true }),
      rawProduct({ id: 'p2', isActive: false }),
    ]);
    renderOverview(buildCatalog());

    const card = (await screen.findByText('Produtos ativos')).closest(
      'article',
    ) as HTMLElement;
    expect(await within(card).findByText('1')).toBeInTheDocument();
    expect(within(card).getByText(/0.*sem foto/)).toBeInTheDocument();
  });

  it('shows the category count', async () => {
    mockMe('Ana Souza');
    mockCategories([
      { id: 'cat-1', name: 'Perfumes' },
      { id: 'cat-2', name: 'Maquiagem' },
    ]);
    renderOverview(buildCatalog());

    expect(await screen.findByText('Categorias')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('2')).toBeInTheDocument());
  });

  it('shows WhatsApp as verified with days elapsed', async () => {
    mockMe('Ana Souza');
    const verifiedAt = new Date(
      Date.now() - 5 * 24 * 60 * 60 * 1000,
    ).toISOString();
    renderOverview(
      buildCatalog({
        isWhatsappVerified: true,
        whatsappVerifiedAt: verifiedAt,
      }),
    );

    expect(
      await screen.findByText(/verificado há 5 dias/i),
    ).toBeInTheDocument();
  });

  it('shows WhatsApp as not verified', async () => {
    mockMe('Ana Souza');
    renderOverview(buildCatalog({ isWhatsappVerified: false }));

    expect(await screen.findByText(/não verificado/i)).toBeInTheDocument();
  });

  it('shows the latest CSV import summary when one exists', async () => {
    mockMe('Ana Souza');
    mockLatestImport({
      catalogId: CATALOG_ID,
      confirmedAt: '2026-09-10T12:00:00Z',
      acceptedCount: 8,
      rejectedCount: 2,
    });
    renderOverview(buildCatalog());

    expect(
      await screen.findByText(/8 aceitos.*2 recusados/i),
    ).toBeInTheDocument();
  });

  it('shows a placeholder when the catalog never imported', async () => {
    mockMe('Ana Souza');
    mockLatestImport(null);
    renderOverview(buildCatalog());

    expect(
      await screen.findByText(/nenhuma importação ainda/i),
    ).toBeInTheDocument();
  });

  it('renders quick action links to the right routes', async () => {
    mockMe('Ana Souza');
    renderOverview(buildCatalog());

    expect(
      await screen.findByRole('link', { name: /adicionar produto/i }),
    ).toHaveAttribute('href', '/products');
    expect(screen.getByRole('link', { name: /importar csv/i })).toHaveAttribute(
      'href',
      '/products',
    );
    expect(
      screen.getByRole('link', { name: /configurar whatsapp/i }),
    ).toHaveAttribute('href', '/whatsapp');
  });

  it('shows an "Ativo" badge for a product that is active, visible, orderable and in stock', async () => {
    mockMe('Ana Souza');
    mockProducts([
      rawProduct({
        isActive: true,
        isVisible: true,
        isOrderable: true,
        quantityAvailable: 5,
      }),
    ]);
    renderOverview(buildCatalog());

    expect(await screen.findByText('Ativo')).toBeInTheDocument();
  });

  it('sorts recent products by createdAt (most recent first), not raw API order', async () => {
    mockMe('Ana Souza');
    mockProducts([
      rawProduct({
        id: 'old',
        name: 'Produto Antigo',
        createdAt: '2026-01-01T00:00:00Z',
      }),
      rawProduct({
        id: 'new',
        name: 'Produto Novo',
        createdAt: '2026-09-01T00:00:00Z',
      }),
    ]);
    renderOverview(buildCatalog());

    const rows = await screen.findAllByRole('row');
    const bodyRowNames = rows.slice(1).map((row) => row.textContent);
    expect(bodyRowNames[0]).toContain('Produto Novo');
    expect(bodyRowNames[1]).toContain('Produto Antigo');
  });

  it('omits the "há N dias" suffix when whatsappVerifiedAt is not a valid date', async () => {
    mockMe('Ana Souza');
    renderOverview(
      buildCatalog({
        isWhatsappVerified: true,
        whatsappVerifiedAt: 'not-a-date',
      }),
    );

    const verified = await screen.findByText(/^verificado$/i);
    expect(verified).toBeInTheDocument();
    expect(screen.queryByText(/dias/)).not.toBeInTheDocument();
  });

  it('lists recent products with name, category, and status badges, never a price', async () => {
    mockMe('Ana Souza');
    mockProducts([
      rawProduct({
        id: 'p1',
        name: 'Perfume Ativo',
        categoryId: 'cat-1',
        isActive: true,
        isVisible: true,
        isOrderable: true,
        quantityAvailable: 5,
      }),
      rawProduct({
        id: 'p2',
        name: 'Perfume Esgotado',
        categoryId: 'cat-1',
        isActive: true,
        isVisible: true,
        isOrderable: false,
        quantityAvailable: 0,
      }),
    ]);
    renderOverview(buildCatalog());

    expect(await screen.findByText('Perfume Ativo')).toBeInTheDocument();
    expect(screen.getByText('Perfume Esgotado')).toBeInTheDocument();
    expect(screen.getAllByText('Perfumes')).toHaveLength(2);
    expect(screen.getByText('Sem estoque')).toBeInTheDocument();
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});
