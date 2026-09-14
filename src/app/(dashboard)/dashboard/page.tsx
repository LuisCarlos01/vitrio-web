import Link from 'next/link';

export default function DashboardPage() {
  return (
    <main>
      <h1>Catálogo</h1>
      {/* Placeholder — overview real (cards de resumo, produtos recentes) é a issue #26 */}
      <p>Resumo em breve.</p>
      <nav>
        <Link href="/store">Loja</Link>
        <Link href="/whatsapp">WhatsApp</Link>
        <Link href="/products">Produtos</Link>
        <Link href="/categories">Categorias</Link>
      </nav>
    </main>
  );
}
