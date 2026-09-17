import { cn } from 'cn';

type StorefrontHeaderProps = {
  name: string;
  logoUrl: string | null;
  instagramHandle: string | null;
  variant?: 'default' | 'overlay';
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function StorefrontHeader({
  name,
  logoUrl,
  instagramHandle,
  variant = 'default',
}: StorefrontHeaderProps) {
  const isOverlay = variant === 'overlay';
  const handle = instagramHandle?.replace(/^@+/, '') ?? null;

  return (
    <div className="flex min-w-0 items-center gap-3">
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- logo vem de um host externo (S3) por catálogo, não faz sentido pré-otimizar em build
        <img
          src={logoUrl}
          alt={name}
          className={cn(
            'size-11 shrink-0 rounded-xl border object-cover',
            isOverlay ? 'border-primary-foreground/40' : 'border-border',
          )}
        />
      )}
      <div className="min-w-0">
        <h1
          className={cn(
            'font-heading truncate text-base font-semibold sm:text-lg',
            isOverlay && 'text-primary-foreground drop-shadow',
          )}
        >
          {name}
        </h1>
        {handle && (
          <a
            href={`https://instagram.com/${handle}`}
            className={cn(
              'inline-flex items-center gap-1 text-xs transition-colors',
              isOverlay
                ? 'text-primary-foreground/80 hover:text-primary-foreground'
                : 'text-muted-foreground hover:text-[var(--tenant-primary)]',
            )}
          >
            <InstagramIcon className="size-3" />@{handle}
          </a>
        )}
      </div>
    </div>
  );
}
