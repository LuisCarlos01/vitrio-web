'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from 'cn';
import { LogoutButton } from '@/features/auth/components/logout-button';
import { NAV_ITEMS } from '../nav-items';

export function SidebarNav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      aria-label="Navegação principal"
      data-collapsed={collapsed}
      className={cn(
        'md:border-sidebar-border md:bg-sidebar hidden md:flex md:flex-col md:gap-1 md:border-r md:p-2',
        'transition-[width] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        collapsed ? 'md:w-16' : 'md:w-56',
      )}
    >
      <div className="flex items-center justify-between p-2">
        <Image
          src={collapsed ? '/brand/icon-preta.png' : '/brand/logo-preta.png'}
          alt="Vitrio"
          width={collapsed ? 24 : 32}
          height={collapsed ? 24 : 32}
          className="block dark:hidden"
        />
        <Image
          src={collapsed ? '/brand/icon-branca.png' : '/brand/logo-branca.png'}
          alt="Vitrio"
          width={collapsed ? 24 : 32}
          height={collapsed ? 24 : 32}
          className="hidden dark:block"
        />
        <button
          type="button"
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0" />
                <span className={cn(collapsed && 'sr-only')}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-sidebar-border mt-auto border-t pt-1">
        <LogoutButton collapsed={collapsed} />
      </div>
    </nav>
  );
}
