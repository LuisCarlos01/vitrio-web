import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
  imageAssetId: string;
  categoryId: string | null;
  quantityAvailable: number;
  isVisible: boolean;
  isOrderable: boolean;
  isActive: boolean;
  createdAt: string;
};

function renderProductList() {
  const queryClient = new QueryClient();
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
              imageAssetId: 'asset1',
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
      imageAssetId: 'asset1',
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
});
