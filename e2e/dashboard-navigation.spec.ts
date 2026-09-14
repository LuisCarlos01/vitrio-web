import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can navigate the dashboard via the persistent sidebar', async ({
  page,
}) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  const sidebar = page.getByRole('navigation', {
    name: /navegação principal/i,
  });
  await expect(sidebar.getByRole('link', { name: 'Catálogo' })).toHaveAttribute(
    'aria-current',
    'page',
  );

  await sidebar.getByRole('link', { name: 'Loja' }).click();
  await expect(page).toHaveURL('/store');

  await sidebar.getByRole('link', { name: 'Produtos' }).click();
  await expect(page).toHaveURL('/products');

  await sidebar.getByRole('link', { name: 'Categorias' }).click();
  await expect(page).toHaveURL('/categories');
});

test('the sidebar collapses to icon-only and back', async ({ page }) => {
  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  const sidebar = page.getByRole('navigation', {
    name: /navegação principal/i,
  });
  await expect(sidebar.getByText('Produtos')).not.toHaveClass('sr-only');

  await page.getByRole('button', { name: /recolher menu/i }).click();
  await expect(sidebar.getByText('Produtos')).toHaveClass('sr-only');

  await page.getByRole('button', { name: /expandir menu/i }).click();
  await expect(sidebar.getByText('Produtos')).not.toHaveClass('sr-only');
});

test('shows the bottom tab bar instead of the sidebar on a mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/register');
  await page.getByLabel(/e-mail/i).fill(uniqueEmail());
  await page.getByLabel(/senha/i).fill('correct-horse-battery');
  await page.getByRole('button', { name: /criar conta/i }).click();
  await page.waitForURL('/dashboard');

  // No mobile, a sidebar fica display:none (fora da árvore de acessibilidade) —
  // só a bottom tab bar aparece via getByRole.
  const bottomBar = page.getByRole('navigation', {
    name: /navegação principal/i,
  });
  await expect(bottomBar).toHaveCount(1);
  await expect(bottomBar.getByRole('link', { name: 'Categorias' })).toHaveCount(
    0,
  );

  await bottomBar.getByRole('link', { name: 'Loja' }).click();
  await expect(page).toHaveURL('/store');
});
