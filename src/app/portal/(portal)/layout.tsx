
import { PortalHeader } from '@/components/layout/portal-header';
import { PortalSidebar } from '@/components/layout/portal-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <PortalSidebar />
      <div className="flex flex-1 flex-col">
        <PortalHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
