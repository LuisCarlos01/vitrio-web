import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import { CategoryList } from './category-list';

function renderCategoryList() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <CategoryList catalogId="catalog-1" />
    </QueryClientProvider>,
  );
}

function mockProducts(products: unknown[] = []) {
  server.use(
    http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/products`, () =>
      HttpResponse.json(products),
    ),
  );
}

describe('CategoryList', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
    mockProducts();
  });

  it('shows the existing categories', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([
          {
            id: 'category-1',
            catalogId: 'catalog-1',
            name: 'Perfumes',
            createdAt: '2025-12-01T00:00:00Z',
          },
        ]),
      ),
    );

    renderCategoryList();

    expect(await screen.findByText('Perfumes')).toBeInTheDocument();
  });

  it('adds a category to the list once created', async () => {
    let categories: Array<{
      id: string;
      catalogId: string;
      name: string;
      createdAt: string;
    }> = [];
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json(categories),
      ),
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`,
        async ({ request }) => {
          const body = (await request.json()) as { name: string };
          const created = {
            id: 'category-1',
            catalogId: 'catalog-1',
            name: body.name,
            createdAt: '2025-12-01T00:00:00Z',
          };
          categories = [...categories, created];
          return HttpResponse.json(created);
        },
      ),
    );

    const user = userEvent.setup();
    renderCategoryList();

    await screen.findByText(/nenhuma categoria/i);

    await user.type(screen.getByLabelText(/nome da categoria/i), 'Perfumes');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(await screen.findByText('Perfumes')).toBeInTheDocument();
  });

  it('renames a category through the edit flow', async () => {
    let name = 'Perfumes';
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([
          {
            id: 'category-1',
            catalogId: 'catalog-1',
            name,
            createdAt: '2025-12-01T00:00:00Z',
          },
        ]),
      ),
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        async ({ request }) => {
          const body = (await request.json()) as { name: string };
          name = body.name;
          return HttpResponse.json({
            id: 'category-1',
            catalogId: 'catalog-1',
            name,
            createdAt: '2025-12-01T00:00:00Z',
          });
        },
      ),
    );

    const user = userEvent.setup();
    renderCategoryList();

    await screen.findByText('Perfumes');
    await user.click(screen.getByRole('button', { name: /editar perfumes/i }));

    const editInput = screen.getByLabelText(/novo nome/i);
    await user.clear(editInput);
    await user.type(editInput, 'Cosméticos');
    await user.click(screen.getByRole('button', { name: /salvar edição/i }));

    expect(await screen.findByText('Cosméticos')).toBeInTheDocument();
  });

  it('deletes a category after confirming in the dialog', async () => {
    let categories = [
      {
        id: 'category-1',
        catalogId: 'catalog-1',
        name: 'Perfumes',
        createdAt: '2025-12-01T00:00:00Z',
      },
    ];
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json(categories),
      ),
      http.delete(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        () => {
          categories = [];
          return HttpResponse.json({});
        },
      ),
    );

    const user = userEvent.setup();
    renderCategoryList();

    await screen.findByText('Perfumes');
    await user.click(screen.getByRole('button', { name: /excluir perfumes/i }));
    await user.click(
      screen.getByRole('button', { name: /confirmar exclusão/i }),
    );

    await waitFor(() =>
      expect(screen.queryByText('Perfumes')).not.toBeInTheDocument(),
    );
  });

  it('rejects a category name made only of whitespace', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([]),
      ),
    );
    const user = userEvent.setup();
    renderCategoryList();

    await screen.findByText(/nenhuma categoria cadastrada/i);
    await user.type(screen.getByLabelText(/nome da categoria/i), '   ');
    await user.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(await screen.findByText(/nome é obrigatório/i)).toBeInTheDocument();
  });

  it('shows how many products are in each category, derived from the product list', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([
          {
            id: 'category-1',
            catalogId: 'catalog-1',
            name: 'Perfumes',
            createdAt: '2025-12-01T00:00:00Z',
          },
          {
            id: 'category-2',
            catalogId: 'catalog-1',
            name: 'Maquiagem',
            createdAt: '2025-12-01T00:00:00Z',
          },
        ]),
      ),
    );
    mockProducts([
      { id: 'p1', categoryId: 'category-1' },
      { id: 'p2', categoryId: 'category-1' },
      { id: 'p3', categoryId: null },
    ]);

    renderCategoryList();

    const perfumesRow = (await screen.findByText('Perfumes')).closest(
      'li',
    ) as HTMLElement;
    const maquiagemRow = screen
      .getByText('Maquiagem')
      .closest('li') as HTMLElement;
    expect(within(perfumesRow).getByText('2')).toBeInTheDocument();
    expect(within(maquiagemRow).getByText('0')).toBeInTheDocument();
  });

  it('warns that deleting a category does not delete its products', async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([
          {
            id: 'category-1',
            catalogId: 'catalog-1',
            name: 'Perfumes',
            createdAt: '2025-12-01T00:00:00Z',
          },
        ]),
      ),
    );
    const user = userEvent.setup();
    renderCategoryList();

    await screen.findByText('Perfumes');
    await user.click(screen.getByRole('button', { name: /excluir perfumes/i }));

    expect(
      screen.getByText(/produtos.*não (serão|são) exclu[ií]dos/i),
    ).toBeInTheDocument();
  });
});
