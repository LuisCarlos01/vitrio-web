import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { API_BASE_URL } from '@/lib/api/config';
import { server } from '@/mocks/server';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from './category';

const categoryDto = {
  id: 'category-1',
  catalogId: 'catalog-1',
  name: 'Perfumes',
  createdAt: '2025-12-01T00:00:00Z',
};

describe('getCategories', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it("resolves with the catalog's categories mapped to the domain type", async () => {
    server.use(
      http.get(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json([categoryDto]),
      ),
    );

    const categories = await getCategories('catalog-1');

    expect(categories).toEqual([{ id: 'category-1', name: 'Perfumes' }]);
  });
});

describe('createCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a POST with the given name and resolves with the created category', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.post(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json(categoryDto);
        },
      ),
    );

    const created = await createCategory('catalog-1', { name: 'Perfumes' });

    expect(receivedBody).toEqual({ name: 'Perfumes' });
    expect(created).toEqual({ id: 'category-1', name: 'Perfumes' });
  });

  it('rejects when the API returns a validation error', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/v1/catalogs/catalog-1/categories`, () =>
        HttpResponse.json({ message: 'name is blank' }, { status: 400 }),
      ),
    );

    await expect(createCategory('catalog-1', { name: '' })).rejects.toThrow();
  });
});

describe('updateCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a PATCH with the given name and resolves with the updated category', async () => {
    let receivedBody: unknown = null;
    server.use(
      http.patch(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ ...categoryDto, name: 'Cosméticos' });
        },
      ),
    );

    const updated = await updateCategory('catalog-1', 'category-1', {
      name: 'Cosméticos',
    });

    expect(receivedBody).toEqual({ name: 'Cosméticos' });
    expect(updated.name).toBe('Cosméticos');
  });
});

describe('deleteCategory', () => {
  beforeEach(() => {
    useAuthStore
      .getState()
      .setSession({ accessToken: 'abc', refreshToken: 'def' });
  });

  it('sends a DELETE for the given category', async () => {
    let called = false;
    server.use(
      http.delete(
        `${API_BASE_URL}/api/v1/catalogs/catalog-1/categories/category-1`,
        () => {
          called = true;
          return HttpResponse.json({});
        },
      ),
    );

    await deleteCategory('catalog-1', 'category-1');

    expect(called).toBe(true);
  });
});
