import path from 'node:path';
import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a customer can browse the public storefront, filter by category, and build a cart', async ({
  page,
}) => {
  // Faz upload de imagem de verdade (POST /assets), que a vitrio-api sobe pro
  // S3 real. No CI as credenciais são fake, então o upload falha — mesma
  // decisão já registrada em dashboard-products.spec.ts. Só este teste
  // depende de upload; o teste de 404 abaixo roda normalmente em CI.
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
  const slug = await page
    .locator('xpath=//label[text()="Slug"]/following-sibling::p')
    .textContent();

  await page.goto('/categories');
  await page.getByLabel(/nome da categoria/i).fill('Perfumes');
  await page.getByRole('button', { name: /adicionar/i }).click();
  await expect(page.getByText('Perfumes')).toBeVisible();

  // Não existe navegação persistente entre telas do dashboard ainda (issue
  // #23, em aberto) — os links só existem em /dashboard.
  await page.goto('/products');
  await page.getByLabel(/^nome$/i).fill('Perfume X');
  await page.getByLabel(/sku/i).fill('PRF-001');
  await page.getByLabel(/categoria/i).selectOption({ label: 'Perfumes' });
  await page
    .getByLabel(/imagem/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  await page.getByRole('button', { name: /adicionar produto/i }).click();
  await expect(page.getByText('Perfume X')).toBeVisible();

  // Produto nasce isVisible=false/isOrderable=false — precisa habilitar pra
  // aparecer na vitrine pública (regra registrada em Product.java).
  await page.getByRole('button', { name: /editar perfume x/i }).click();
  await page.getByLabel(/quantidade disponível/i).fill('5');
  await page.getByLabel(/^visível$/i).check();
  await page.getByLabel(/disponível para compra/i).check();
  await page.getByRole('button', { name: /salvar produto/i }).click();

  await page.goto(`/${slug}`);

  await expect(
    page.getByRole('heading', { name: 'Loja da Ana' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Perfumes' })).toBeVisible();
  // "Perfume X" também aparece como título do carrossel de banners — o card
  // do grid é o único que renderiza o nome como botão (abre o modal).
  await expect(page.getByRole('button', { name: 'Perfume X' })).toBeVisible();
  await expect(page.getByText(/R\$/)).toHaveCount(0);

  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: /Ver carrinho/ }).click();

  const cartDialog = page.getByRole('dialog', { name: 'Carrinho' });
  await expect(cartDialog.getByText('Perfume X')).toBeVisible();
  await expect(
    cartDialog.getByText(/loja ainda não confirmou o WhatsApp/i),
  ).toBeVisible();
  await expect(
    cartDialog.getByRole('link', { name: /Finalizar no WhatsApp/ }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: /Falar no WhatsApp/ }),
  ).toHaveCount(0);

  // Carrinho é client-side (localStorage) — sobrevive a um reload da SSR.
  await page.reload();
  await page.getByRole('button', { name: /Ver carrinho.*1/ }).click();
  await expect(
    page.getByRole('dialog', { name: 'Carrinho' }).getByText('Perfume X'),
  ).toBeVisible();
});

test('visiting an unknown store slug shows the branded 404, not the raw API error', async ({
  page,
}) => {
  await page.goto('/loja-que-nao-existe-e2e');

  await expect(
    page.getByRole('heading', { name: 'Não encontramos essa loja' }),
  ).toBeVisible();
});
