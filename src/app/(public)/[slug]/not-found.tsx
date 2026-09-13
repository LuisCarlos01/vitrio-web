import Image from 'next/image';

export default function StorefrontNotFound() {
  return (
    <main>
      <Image src="/brand/icon-flat.png" alt="Vitrio" width={48} height={48} />
      <h1>Não encontramos essa loja</h1>
      <p>Confira se o endereço está certo e tente novamente.</p>
    </main>
  );
}
