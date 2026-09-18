import { BottomTabBar } from '@/features/dashboard/components/bottom-tab-bar';
import { SidebarNav } from '@/features/dashboard/components/sidebar-nav';
import { LogoutButton } from '@/features/auth/components/logout-button';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <SidebarNav />
      {/* A barra inferior mobile já tem seus 4 destinos fixos (ADR 0001) — sair
          fica num botão à parte, não uma 5ª aba. */}
      <LogoutButton
        collapsed
        className="bg-sidebar border-sidebar-border fixed top-2 right-2 z-30 rounded-full border p-2 shadow-sm md:hidden"
      />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}
