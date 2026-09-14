import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can configure and verify their WhatsApp number', async ({
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

  await page.goto('/whatsapp');
  await page.getByLabel(/whatsapp/i).fill('(11) 91234-5678');
  await page.getByRole('button', { name: /salvar whatsapp/i }).click();

  await expect(page.getByText(/não verificado/i)).toBeVisible();

  await page.getByRole('button', { name: /verificar/i }).click();

  await expect(page.getByText(/^verificado$/i)).toBeVisible();
});
