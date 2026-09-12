import path from 'node:path';
import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can create a product, edit its stock/visibility, and delete it', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.getByRole('link', { name: /produtos/i }).click();
  await page.waitForURL('/products');

  await page.getByLabel(/^nome$/i).fill('Perfume X');
  await page.getByLabel(/sku/i).fill('PRF-001');
  await page
    .getByLabel(/imagem/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  await page.getByRole('button', { name: /adicionar produto/i }).click();
  await expect(page.getByText('Perfume X')).toBeVisible();

  // Desativa o produto.
  await page.getByRole('button', { name: /editar perfume x/i }).click();
  await page.getByLabel(/^ativo$/i).uncheck();
  await page.getByRole('button', { name: /salvar produto/i }).click();
  await expect(page.getByText('Inativo')).toBeVisible();

  // Reativa sem tocar em visível/disponível — os dois devem continuar
  // desmarcados (regra: reativar não restaura o resto sozinho).
  await page.getByRole('button', { name: /editar perfume x/i }).click();
  await expect(page.getByLabel(/^visível$/i)).not.toBeChecked();
  await expect(page.getByLabel(/disponível para compra/i)).not.toBeChecked();
  await page.getByLabel(/^ativo$/i).check();
  await page.getByRole('button', { name: /salvar produto/i }).click();
  await expect(page.getByText('Não visível')).toBeVisible();

  await page.getByRole('button', { name: /excluir perfume x/i }).click();
  await page.getByRole('button', { name: /confirmar exclusão/i }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});
