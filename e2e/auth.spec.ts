import { expect, test } from '@playwright/test';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe('auth', () => {
  test('a reseller can register and land on the dashboard', async ({
    page,
  }) => {
    await page.goto('/register');

    await page.getByLabel(/e-mail/i).fill(uniqueEmail());
    await page
      .getByLabel('Senha', { exact: true })
      .fill('correct-horse-battery');
    await page.getByRole('button', { name: /criar conta/i }).click();

    // A rota /dashboard ainda não tem página própria (feature futura); o que
    // este teste garante é que o registro foi aceito pela API real e o
    // frontend navegou pra lá, não o conteúdo da página em si.
    await page.waitForURL('/dashboard');
  });

  test('a reseller can log in with an existing account and land on the dashboard', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail();
    const password = 'correct-horse-battery';

    const registerResponse = await request.post(
      `${API_BASE_URL}/api/v1/auth/register`,
      { data: { email, password } },
    );
    expect(registerResponse.ok()).toBe(true);

    await page.goto('/login');

    await page.getByLabel(/e-mail/i).fill(email);
    await page.getByLabel('Senha', { exact: true }).fill(password);
    await page.getByRole('button', { name: /entrar/i }).click();

    await page.waitForURL('/dashboard');
  });
});
