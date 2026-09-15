import {
  LayoutDashboard,
  MessageCircle,
  Package,
  Store,
  Tags,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Presente na bottom tab bar mobile (só 4 cabem — ver ADR 0001/0002). */
  mobile: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Catálogo',
    icon: LayoutDashboard,
    mobile: true,
  },
  { href: '/products', label: 'Produtos', icon: Package, mobile: true },
  { href: '/store', label: 'Loja', icon: Store, mobile: true },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, mobile: true },
  { href: '/categories', label: 'Categorias', icon: Tags, mobile: false },
];
