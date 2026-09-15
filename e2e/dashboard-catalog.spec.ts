import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test("a reseller can edit and persist their store's name", async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  const nameInput = page.getByLabel(/^nome$/i);
  await expect(nameInput).toHaveValue('Loja da Ana');
  await nameInput.fill('Loja da Ana Atualizada');
  await page.getByRole('button', { name: /salvar dados da loja/i }).click();

  await expect(nameInput).toHaveValue('Loja da Ana Atualizada');

  await page.reload();

  await expect(page.getByLabel(/^nome$/i)).toHaveValue(
    'Loja da Ana Atualizada',
  );
});

test('a reseller can pick a curated color palette and persist it', async ({
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

  await page.getByRole('radio', { name: /noturno/i }).click();
  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === 'PATCH' && response.ok(),
  );
  await page.getByRole('button', { name: /salvar dados da loja/i }).click();
  await updateResponse;

  await expect(page.getByRole('radio', { name: /noturno/i })).toBeChecked();

  await page.reload();

  await expect(page.getByRole('radio', { name: /noturno/i })).toBeChecked();
});
