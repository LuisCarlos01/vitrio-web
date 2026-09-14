import { BottomTabBar } from '@/features/dashboard/components/bottom-tab-bar';
import { SidebarNav } from '@/features/dashboard/components/sidebar-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <SidebarNav />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <BottomTabBar />
    </div>
  );
}
