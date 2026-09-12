import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can create, rename, and delete a category', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.getByRole('link', { name: /categorias/i }).click();
  await page.waitForURL('/categories');

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
