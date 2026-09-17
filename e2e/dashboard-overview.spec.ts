import path from 'node:path';
import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller sees a real summary of their catalog on /dashboard', async ({
  page,
}) => {
  // Faz upload de imagem de verdade (POST /assets) — mesma decisão já
  // registrada em dashboard-products.spec.ts, credenciais fake no CI.
  test.skip(
    !!process.env.CI,
    'requires real (or LocalStack) S3 credentials, unavailable in CI today',
  );

  const email = uniqueEmail();
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(email);
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
  await page.getByLabel(/categoria/i).selectOption({ label: 'Perfumes' });
  await page
    .getByLabel(/imagem/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  await page.getByRole('button', { name: /adicionar produto/i }).click();
  await expect(page.getByText('Perfume X')).toBeVisible();

  await page.goto('/dashboard');

  // Sem nome cadastrado (sem tela de perfil ainda) — saudação cai pra
  // parte local do e-mail, decisão do vitrio-web documentada no handoff.
  const emailLocalPart = email.split('@')[0];
  await expect(
    page.getByRole('heading', {
      name: new RegExp(`olá, ${emailLocalPart}`, 'i'),
    }),
  ).toBeVisible();

  // Os cards de resumo viraram Card/CardHeader/CardContent (#65) — título e
  // valor não são mais irmãos diretos, então sobe até o Card ancestral
  // (data-slot="card") em vez de só um nível (xpath=./..).
  const productsCard = page
    .getByText('Produtos ativos')
    .locator('xpath=ancestor::*[@data-slot="card"]');
  await expect(productsCard.getByText('1', { exact: true })).toBeVisible();
  await expect(productsCard.getByText(/sem foto/i)).toContainText('0');

  const categoriesCard = page
    .getByText('Categorias')
    .locator('xpath=ancestor::*[@data-slot="card"]');
  await expect(categoriesCard.getByText('1', { exact: true })).toBeVisible();

  await expect(page.getByText(/não verificado/i)).toBeVisible();
  await expect(page.getByText(/nenhuma importação ainda/i)).toBeVisible();

  await expect(page.getByRole('cell', { name: 'Perfume X' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Perfumes' })).toBeVisible();
  await expect(page.getByText(/R\$/)).toHaveCount(0);

  await page.getByRole('link', { name: /configurar whatsapp/i }).click();
  await expect(page).toHaveURL('/whatsapp');
});
