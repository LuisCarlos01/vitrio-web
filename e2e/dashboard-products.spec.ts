import path from 'node:path';
import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

// Faz upload de imagem de verdade (POST /assets), que a vitrio-api sobe pro S3
// real. No CI as credenciais são fake (só existem pra o S3Client inicializar,
// ver .github/workflows/ci.yml), então o upload falha — sem LocalStack ou um
// bucket de teste dedicado, este teste só roda de forma confiável localmente.
test.skip(
  !!process.env.CI,
  'requires real (or LocalStack) S3 credentials, unavailable in CI today',
);

test('a reseller can create a product, edit its stock/visibility, and delete it', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.goto('/products');

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
  await expect(page.getByText('Oculto')).toBeVisible();

  await page.getByRole('button', { name: /excluir perfume x/i }).click();
  await page.getByRole('button', { name: /confirmar exclusão/i }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('a reseller adds a product through the mobile FAB', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await page.goto('/products');

  // No mobile, o formulário inline (desktop) fica display:none — só o FAB abre.
  await expect(page.getByLabel(/^nome$/i)).not.toBeVisible();
  await page.getByRole('button', { name: /novo produto/i }).click();

  const dialog = page.getByRole('dialog', { name: /adicionar produto/i });
  await dialog.getByLabel(/^nome$/i).fill('Batom Y');
  await dialog
    .getByLabel(/imagem/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  await dialog.getByRole('button', { name: /adicionar produto/i }).click();

  await expect(dialog).not.toBeVisible();
  await expect(page.getByText('Batom Y')).toBeVisible();
});
