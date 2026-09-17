import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { ProductList } from './product-list';

type RawProduct = {
  id: string;
  catalogId: string;
  name: string;
  sku: string | null;
  description: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  quantityAvailable: number;
  isVisible: boolean;
  isOrderable: boolean;
  isActive: boolean;
  createdAt: string;
};

function renderProductList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ProductList catalogId="catalog-1" />
    </QueryClientProvider>,
  );
}

function mockCategoriesEmpty() {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
      HttpResponse.json([]),
    ),
  );
}

function mockCategories(categories: { id: string; name: string }[]) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
      HttpResponse.json(
        categories.map((c) => ({
          ...c,
          catalogId: 'catalog-1',
          createdAt: '2026-01-01T00:00:00Z',
        })),
      ),
    ),
  );
}

function mockProducts(products: RawProduct[]) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
      HttpResponse.json(products),
    ),
  );
}

function rawProduct(overrides: Partial<RawProduct> = {}): RawProduct {
  return {
    id: 'p1',
    catalogId: 'catalog-1',
    name: 'Perfume X',
    sku: null,
    description: null,
    imageUrl: 'https://cdn.example.com/asset1.png',
    categoryId: null,
    quantityAvailable: 3,
    isVisible: true,
    isOrderable: true,
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('ProductList', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
    mockCategoriesEmpty();
  });

  it('shows the existing products with their stock/visibility state', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json(
          [
            {
              id: 'p1',
              catalogId: 'catalog-1',
              name: 'Perfume X',
              sku: 'PRF-001',
              description: null,
              imageUrl: 'https://cdn.example.com/asset1.png',
              categoryId: null,
              quantityAvailable: 0,
              isVisible: true,
              isOrderable: false,
              isActive: true,
            } satisfies Omit<RawProduct, 'createdAt'>,
          ].map((p) => ({ ...p, createdAt: '2026-01-01T00:00:00Z' })),
        ),
      ),
    );

    renderProductList();

    expect(await screen.findByText('Perfume X')).toBeInTheDocument();
    expect(screen.getByText(/sem estoque/i)).toBeInTheDocument();
  });

  it('does not silently restore visibility/orderability when reactivating a product', async () => {
    let product: RawProduct = {
      id: 'p1',
      catalogId: 'catalog-1',
      name: 'Perfume X',
      sku: null,
      description: null,
      imageUrl: 'https://cdn.example.com/asset1.png',
      categoryId: null,
      quantityAvailable: 3,
      isVisible: false,
      isOrderable: false,
      isActive: false,
      createdAt: '2026-01-01T00:00:00Z',
    };
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json([product]),
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/products/p1`,
        async ({ request }) => {
          const patch = (await request.json()) as Partial<RawProduct>;
          product = { ...product, ...patch };
          return HttpResponse.json(product);
        },
      ),
    );

    const user = userEvent.setup();
    renderProductList();

    await user.click(
      await screen.findByRole('button', { name: /editar perfume x/i }),
    );

    // Só marca "Ativo" — não mexe em "Visível" nem "Disponível para compra".
    await user.click(screen.getByLabelText(/^ativo$/i));
    await user.click(screen.getByRole('button', { name: /salvar produto/i }));

    await waitFor(() => expect(product.isActive).toBe(true));

    expect(product.isVisible).toBe(false);
    expect(product.isOrderable).toBe(false);
  });

  it('shows a duplicate-SKU error when creating a product with a SKU already in use', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json([]),
      ),
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/assets`, () =>
        HttpResponse.json({
          id: 'asset1',
          catalogId: 'catalog-1',
          contentType: 'image/png',
          byteSize: 4,
          publicUrl: 'https://cdn.example.com/asset1.png',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      ),
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json({ message: 'SKU already in use' }, { status: 409 }),
      ),
    );

    const user = userEvent.setup();
    renderProductList();

    await screen.findByText(/nenhum produto cadastrado/i);

    await user.type(screen.getByLabelText(/nome/i), 'Perfume X');
    await user.type(screen.getByLabelText(/sku/i), 'PRF-001');
    const file = new File(['fake'], 'perfume.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText(/imagem/i), file);
    await user.click(
      screen.getByRole('button', { name: /adicionar produto/i }),
    );

    expect(await screen.findByText(/sku já está em uso/i)).toBeInTheDocument();
  });

  it('shows SKU, category, stock and status badges for each product', async () => {
    mockCategories([{ id: 'cat-1', name: 'Perfumes' }]);
    mockProducts([
      rawProduct({
        sku: 'PRF-001',
        categoryId: 'cat-1',
        quantityAvailable: 5,
        isVisible: false,
        isActive: false,
      }),
    ]);
    renderProductList();

    const row = (await screen.findByText('Perfume X')).closest(
      'li',
    ) as HTMLElement;
    expect(within(row).getByText('PRF-001')).toBeInTheDocument();
    expect(within(row).getByText('Perfumes')).toBeInTheDocument();
    expect(within(row).getByText('5')).toBeInTheDocument();
    expect(within(row).getByText('Inativo')).toBeInTheDocument();
    expect(within(row).getByText('Oculto')).toBeInTheDocument();
    expect(within(row).queryByText(/^ativo$/i)).not.toBeInTheDocument();
    expect(within(row).queryByText(/^visível$/i)).not.toBeInTheDocument();
  });

  it('shows the active/visible badges for a normal in-stock product', async () => {
    mockProducts([rawProduct()]);
    renderProductList();

    await screen.findByText('Perfume X');
    expect(screen.getByText('Ativo')).toBeInTheDocument();
    expect(screen.getByText('Visível')).toBeInTheDocument();
    expect(screen.queryByText(/sem estoque/i)).not.toBeInTheDocument();
  });

  it('lets a reseller add a product from the mobile FAB without duplicating the desktop form', async () => {
    mockProducts([]);
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/assets`, () =>
        HttpResponse.json({
          id: 'asset1',
          catalogId: 'catalog-1',
          contentType: 'image/png',
          byteSize: 4,
          publicUrl: 'https://cdn.example.com/asset1.png',
          createdAt: '2026-01-01T00:00:00Z',
        }),
      ),
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json(rawProduct({ name: 'Batom Y' })),
      ),
    );
    const user = userEvent.setup();
    renderProductList();

    await screen.findByText(/nenhum produto cadastrado/i);
    // antes de abrir o FAB, só existe o formulário inline (desktop) no DOM.
    expect(screen.getAllByLabelText(/^nome$/i)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /novo produto/i }));
    // com o diálogo mobile aberto, os dois formulários coexistem no DOM —
    // escopar as buscas dentro do diálogo evita ambiguidade com o form desktop.
    const dialog = screen.getByRole('dialog', { name: /adicionar produto/i });
    await user.type(within(dialog).getByLabelText(/^nome$/i), 'Batom Y');
    await user.upload(
      within(dialog).getByLabelText(/imagem/i),
      new File(['fake'], 'batom.png', { type: 'image/png' }),
    );
    await user.click(
      within(dialog).getByRole('button', { name: /adicionar produto/i }),
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /adicionar produto/i }),
      ).not.toBeInTheDocument(),
    );
  });

  it('opens the photo viewer when clicking a product photo', async () => {
    mockProducts([
      rawProduct({ imageUrl: 'https://cdn.example.com/perfume.png' }),
    ]);
    const user = userEvent.setup();
    renderProductList();

    await screen.findByText('Perfume X');
    await user.click(
      screen.getByRole('button', { name: /ver foto de perfume x/i }),
    );

    expect(
      within(screen.getByTestId('product-photo-modal')).getByAltText(
        'Perfume X',
      ),
    ).toHaveAttribute('src', 'https://cdn.example.com/perfume.png');
  });

  it('has no photo button for a product without a resolved image', async () => {
    mockProducts([rawProduct({ imageUrl: null })]);
    renderProductList();

    await screen.findByText('Perfume X');
    expect(
      screen.queryByRole('button', { name: /ver foto de perfume x/i }),
    ).not.toBeInTheDocument();
  });

  it('shows a query error, not the empty state, when the products request fails', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
        HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
      ),
    );

    renderProductList();

    expect(
      await screen.findByText(/não foi possível carregar os produtos/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/nenhum produto cadastrado/i),
    ).not.toBeInTheDocument();
  });

  it('shows an error message when saving a product edit fails', async () => {
    mockProducts([rawProduct()]);
    server.use(
      http.patch(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products/p1`, () =>
        HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderProductList();

    await user.click(
      await screen.findByRole('button', { name: /editar perfume x/i }),
    );
    await user.click(screen.getByRole('button', { name: /salvar produto/i }));

    expect(
      await screen.findByText(/não foi possível salvar o produto/i),
    ).toBeInTheDocument();
  });

  it('shows an error message when deleting a product fails', async () => {
    mockProducts([rawProduct()]);
    server.use(
      http.delete(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products/p1`, () =>
        HttpResponse.json({ message: 'Internal error' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderProductList();

    await user.click(
      await screen.findByRole('button', { name: /excluir perfume x/i }),
    );
    await user.click(
      screen.getByRole('button', { name: /confirmar exclusão/i }),
    );

    expect(
      await screen.findByText(/não foi possível excluir o produto/i),
    ).toBeInTheDocument();
  });
});
