'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from 'cn';
import { NAV_ITEMS } from '../nav-items';

const MOBILE_ITEMS = NAV_ITEMS.filter((item) => item.mobile);

export function BottomTabBar() {
  const pathname = usePathname();
  const activeIndex = MOBILE_ITEMS.findIndex((item) => item.href === pathname);
  const slotWidth = 100 / MOBILE_ITEMS.length;

  return (
    <nav
      aria-label="Navegação principal"
      className="border-sidebar-border bg-sidebar fixed inset-x-0 bottom-0 flex border-t md:hidden"
    >
      {activeIndex >= 0 && (
        <div
          data-testid="active-tab-indicator"
          aria-hidden
          className="absolute top-1 -z-10 flex h-8 items-center justify-center transition-[left] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            left: `${activeIndex * slotWidth}%`,
            width: `${slotWidth}%`,
          }}
        >
          <span className="bg-primary size-8 rounded-full" />
        </div>
      )}
      {MOBILE_ITEMS.map((item) => {
        const isActive = item.href === pathname;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors',
              isActive
                ? 'text-sidebar-accent-foreground'
                : 'text-sidebar-foreground',
            )}
          >
            <Icon aria-hidden className="size-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
