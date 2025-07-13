'use client';

import { WebsiteHeader } from '@/components/layout/website-header';
import { WebsiteFooter } from '@/components/layout/website-footer';
import { PageTransition } from '@/components/ui/page-transition';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <WebsiteHeader />
      <PageTransition>
        <main className="flex-1">{children}</main>
      </PageTransition>
      <WebsiteFooter />
    </div>
  );
}
