import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test('a reseller can preview a CSV and confirm the import', async ({
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

  const csv =
    'nome,codigo,descricao,imagem\n' +
    'Perfume Válido,PRF-100,,https://example.com/nao-existe.png\n' +
    ',,sem nome,\n';

  await page.getByLabel(/arquivo csv/i).setInputFiles({
    name: 'produtos.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(csv, 'utf-8'),
  });
  await page.getByRole('button', { name: /pré-visualizar/i }).click();

  // A primeira linha de dados é estruturalmente válida (nome + URL bem
  // formada) — a prévia não baixa a imagem, só valida formato. A segunda não
  // tem nome nem imagem. Mensagens de erro vêm cruas da API, em inglês (não
  // há camada de tradução — ver nota no relatório da feature).
  await expect(page.getByText('Perfume Válido')).toBeVisible();
  await expect(page.getByText(/name is required/i)).toBeVisible();

  await page.getByRole('button', { name: /confirmar importação/i }).click();

  // A URL não aponta pra uma imagem de verdade, então a linha estruturalmente
  // válida é recusada na confirmação por falha ao baixar a imagem — mesmo
  // assim prova que preview → confirm reenviando o arquivo funciona
  // fim-a-fim contra a API real, e que a resposta reporta por linha.
  await expect(page.getByText(/perfume válido: recusado/i)).toBeVisible();
});
