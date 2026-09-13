type StorefrontHeaderProps = {
  name: string;
  instagramHandle: string | null;
};

export function StorefrontHeader({
  name,
  instagramHandle,
}: StorefrontHeaderProps) {
  return (
    <header>
      <h1>{name}</h1>
      {instagramHandle && (
        <a href={`https://instagram.com/${instagramHandle}`}>
          @{instagramHandle}
        </a>
      )}
    </header>
  );
}
