import path from 'node:path';
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

test('a reseller sees a non-blocking contrast warning for a hard-to-read palette', async ({
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

  await expect(page.getByRole('radio', { name: /clássico/i })).toBeChecked();
  await expect(page.getByText(/pode ficar difícil de ler/i)).not.toBeVisible();

  await page.getByRole('radio', { name: /vibrante/i }).click();

  await expect(page.getByText(/pode ficar difícil de ler/i)).toBeVisible();

  const saveButton = page.getByRole('button', {
    name: /salvar dados da loja/i,
  });
  await expect(saveButton).toBeEnabled();

  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === 'PATCH' && response.ok(),
  );
  await saveButton.click();
  await updateResponse;
});

test('a reseller can upload a logo and see it persist after reload', async ({
  page,
}) => {
  // Faz upload de imagem de verdade (POST /assets), que a vitrio-api sobe pro
  // S3 real. No CI as credenciais são fake, então o upload falha — só roda de
  // forma confiável localmente (mesma ressalva de e2e/dashboard-products.spec.ts).
  test.skip(
    !!process.env.CI,
    'requires real (or LocalStack) S3 credentials, unavailable in CI today',
  );

  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  await page.goto('/store');
  await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
  await page.getByRole('button', { name: /criar loja/i }).click();

  await expect(page.getByAltText(/logo atual/i)).not.toBeVisible();

  await page
    .getByLabel(/^logo$/i)
    .setInputFiles(path.join(__dirname, 'fixtures', 'product.png'));
  const updateResponse = page.waitForResponse(
    (response) => response.request().method() === 'PATCH' && response.ok(),
  );
  await page.getByRole('button', { name: /salvar dados da loja/i }).click();
  await updateResponse;

  await expect(page.getByAltText(/logo atual/i)).toBeVisible();

  await page.reload();

  await expect(page.getByAltText(/logo atual/i)).toBeVisible();
});

test('the WhatsApp button preview updates live as the reseller picks a palette', async ({
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

  const preview = page.getByText(/falar no whatsapp/i);
  await expect(preview).toHaveCSS('background-color', 'rgb(184, 134, 11)'); // Clássico, #B8860B

  await page.getByRole('radio', { name: /noturno/i }).click();

  await expect(preview).toHaveCSS('background-color', 'rgb(245, 158, 11)'); // Noturno, #F59E0B
});
