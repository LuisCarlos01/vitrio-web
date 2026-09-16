import path from 'node:path';
import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can create, rename, and delete a category', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel('Senha', { exact: true }).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.goto('/categories');

  await page.getByLabel(/nome da categoria/i).fill('Perfumes');
  await page.getByRole('button', { name: /adicionar/i }).click();
  await expect(page.getByText('Perfumes')).toBeVisible();

  await page.getByRole('button', { name: /editar perfumes/i }).click();
  const editInput = page.getByLabel(/novo nome/i);
  await editInput.fill('Cosméticos');
  await page.getByRole('button', { name: /salvar edição/i }).click();
  await expect(page.getByText('Cosméticos')).toBeVisible();

  await page.getByRole('button', { name: /excluir cosméticos/i }).click();
  await page.getByRole('button', { name: /confirmar exclusão/i }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('shows the product count per category and warns before deleting one', async ({
  page,
}) => {
  // Faz upload de imagem de verdade (POST /assets), que a vitrio-api sobe pro
  // S3 real — só roda de forma confiável localmente (mesma ressalva de
  // e2e/dashboard-products.spec.ts).
  test.skip(
    !!process.env.CI,
    'requires real (or LocalStack) S3 credentials, unavailable in CI today',
  );

  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel('Senha', { exact: true }).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.goto('/categories');
  await page.getByLabel(/nome da categoria/i).fill('Perfumes');
  await page.getByRole('button', { name: /adicionar/i }).click();
  await expect(page.getByText('Perfumes')).toBeVisible();

  await page.goto('/products');
  await page.getByLabel(/^nome$/i).fill('Perfume X');
  await page
    .getByLabel(/imagem/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  await page.getByLabel(/categoria/i).selectOption({ label: 'Perfumes' });
  await page.getByRole('button', { name: /adicionar produto/i }).click();
  await expect(page.getByText('Perfume X')).toBeVisible();

  await page.goto('/categories');
  const row = page.getByRole('listitem').filter({ hasText: 'Perfumes' });
  await expect(row.getByText('1', { exact: true })).toBeVisible();

  await row.getByRole('button', { name: /excluir perfumes/i }).click();
  await expect(
    page.getByText(/produtos.*não (serão|são) exclu[ií]dos/i),
  ).toBeVisible();
});

test('links back to Produtos on mobile, since Categorias has no bottom-tab entry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel('Senha', { exact: true }).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.goto('/categories');
  await page
    .getByRole('main')
    .getByRole('link', { name: /produtos/i })
    .click();

  await expect(page).toHaveURL('/products');
});
