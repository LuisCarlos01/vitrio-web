type StorefrontHeaderProps = {
  name: string;
  logoUrl: string | null;
  instagramHandle: string | null;
};

export function StorefrontHeader({
  name,
  logoUrl,
  instagramHandle,
}: StorefrontHeaderProps) {
  return (
    <header>
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- logo vem de um host externo (S3) por catálogo, não faz sentido pré-otimizar em build
        <img src={logoUrl} alt={name} />
      )}
      <h1>{name}</h1>
      {instagramHandle && (
        <a href={`https://instagram.com/${instagramHandle}`}>
          @{instagramHandle}
        </a>
      )}
    </header>
  );
}
