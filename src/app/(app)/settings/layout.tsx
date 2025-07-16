'use client';

import { useState } from 'react';
import { SettingsSidebar } from '@/components/layout/settings-sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="hidden md:block md:col-span-1">
        <SettingsSidebar />
      </div>
      <div className="md:hidden">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SettingsSidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="col-span-1 md:col-span-3">{children}</div>
    </div>
  );
}
