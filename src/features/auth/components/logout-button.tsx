'use client';

import { LogOutIcon } from 'lucide-react';
import { cn } from 'cn';
import { useLogout } from '../hooks/use-logout';

export function LogoutButton({
  className,
  collapsed = false,
}: {
  className?: string;
  collapsed?: boolean;
}) {
  const handleLogout = useLogout();

  return (
    <button
      type="button"
      onClick={() => {
        void handleLogout();
      }}
      className={cn(
        'text-sidebar-foreground hover:bg-sidebar-accent/50 flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
        className,
      )}
    >
      <LogOutIcon aria-hidden className="size-4 shrink-0" />
      <span className={cn(collapsed && 'sr-only')}>Sair</span>
    </button>
  );
}
