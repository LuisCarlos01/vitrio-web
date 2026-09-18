import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe('dashboard route guard', () => {
  test('redirects to /login when there is no session', async ({ page }) => {
    await page.goto('/products');

    await page.waitForURL('/login');
  });

  test('also guards /store and /whatsapp', async ({ page }) => {
    await page.goto('/store');
    await page.waitForURL('/login');

    await page.goto('/whatsapp');
    await page.waitForURL('/login');
  });

  test('allows access to a dashboard route after logging in', async ({
    page,
  }) => {
    await page.goto('/register');
    await page.getByLabel(/e-mail/i).fill(uniqueEmail());
    await page
      .getByLabel('Senha', { exact: true })
      .fill('correct-horse-battery');
    await page.getByRole('button', { name: /criar conta/i }).click();
    await page.waitForURL('/dashboard');

    await page.goto('/store');
    await page.getByLabel(/nome da sua loja/i).fill('Loja da Ana');
    await page.getByRole('button', { name: /criar loja/i }).click();

    await page.goto('/products');

    await expect(page).toHaveURL('/products');
    await expect(
      page.getByRole('heading', { name: /produtos/i }),
    ).toBeVisible();
  });

  test('signing out clears the session and blocks the dashboard again', async ({
    page,
  }) => {
    await page.goto('/register');
    await page.getByLabel(/e-mail/i).fill(uniqueEmail());
    await page
      .getByLabel('Senha', { exact: true })
      .fill('correct-horse-battery');
    await page.getByRole('button', { name: /criar conta/i }).click();
    await page.waitForURL('/dashboard');

    await page
      .getByRole('button', { name: /^sair$/i })
      .first()
      .click();
    await page.waitForURL('/login');

    await page.goto('/dashboard');
    await page.waitForURL('/login');
  });

  test('redirects to /login instead of hanging when the API rejects the session as expired', async ({
    page,
  }) => {
    await page.goto('/register');
    await page.getByLabel(/e-mail/i).fill(uniqueEmail());
    await page
      .getByLabel('Senha', { exact: true })
      .fill('correct-horse-battery');
    await page.getByRole('button', { name: /criar conta/i }).click();
    await page.waitForURL('/dashboard');

    // Corrompe os dois tokens guardados — simula uma sessão expirada onde
    // até o refresh falha (era esse o bug: tela presa em erro pra sempre).
    await page.evaluate(() => {
      const raw = localStorage.getItem('vitrio-auth');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      parsed.state.accessToken = 'expired-token';
      parsed.state.refreshToken = 'expired-refresh-token';
      localStorage.setItem('vitrio-auth', JSON.stringify(parsed));
    });

    await page.goto('/products');
    await page.waitForURL('/login');
  });
});
